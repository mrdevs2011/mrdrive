import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import crypto from "crypto";

// Bular MRdrive'ning o'z frontend config.js'idagi bilan bir xil, ochiq
// (public) qiymatlar — service_role kalit emas, xavfsiz.
const SUPABASE_URL = process.env.SUPABASE_URL;
// Bu MCP endpoint endi bitta hisob emas, KO'P foydalanuvchi uchun ishlaydi:
// har so'rov o'zining ?name= + ?token= qiymati orqali "kim" ekanini isbotlaydi.
// Token = sha256(sha256(username)+sha256(password))[:48] — server siri YO'Q.
// RLS'ni chetlab o'tuvchi service_role kalit kerak; so'rov ichida biz o'zimiz
// har doim aniq user_id bilan filtrlaymiz.
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// MRdrive web ilovasi qaysi domenda turibdi — pull/push/refresh_link
// qaytaradigan link shu domenga ?share=TOKEN qo'shib hosil qilinadi (xom
// Supabase signed URL emas). Kerak bo'lsa Vercel env var orqali override qiling.
const APP_URL = (process.env.APP_URL || "https://mrdrive.vercel.app").replace(/\/+$/, "");

const BUCKET = "files";
const TABLE = "files";
const FOLDERS_TABLE = "folders";

// Web ilovadagi (app.js) bilan bir xil ro'yxat — xavfsizlik uchun
// bloklangan fayl kengaytmalari.
const BLOCKED_EXTENSIONS = [
  "exe", "bat", "cmd", "sh", "msi", "com", "scr",
  "vbs", "js", "jar", "ps1", "app", "dmg", "apk"
];

function isBlockedFile(filename) {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  return BLOCKED_EXTENSIONS.includes(ext);
}

// Web ilovadagi generateToken() bilan bir xil format (32 hex belgi).
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * ?name= + ?token= orqali foydalanuvchini topadi.
 * - token: user_metadata.mcp_token bilan mos kelishi shart (48 hex)
 * - name:  user_metadata.name bilan ANIQ (case-sensitive) mos kelishi shart
 * Mos kelmasa aniq xato — Claude bir nechta account ulaganda aralashib ketmasin.
 */
async function resolveUserFromNameAndToken(name, token) {
  if (!name || typeof name !== "string") {
    throw new Error("MCP havolasida ?name= yo'q yoki bo'sh.");
  }
  if (!/^[0-9a-f]{48}$/i.test(token || "")) {
    throw new Error("MCP havolasi noto'g'ri — token topilmadi yoki formati xato (48 hex belgi kerak).");
  }
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY environment variable topilmadi."
    );
  }

  const sbAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tokenLower = token.toLowerCase();
  let page = 1;
  const perPage = 200;
  let matchedByToken = null;

  // Barcha foydalanuvchilarni sahifalab qidiramiz (mcp_token unique bo'lishi kutiladi).
  for (;;) {
    const { data, error } = await sbAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error("Foydalanuvchini topib bo'lmadi: " + error.message);
    const users = data?.users || [];
    if (users.length === 0) break;

    for (const u of users) {
      const meta = u.user_metadata || {};
      const storedToken = (meta.mcp_token || "").toLowerCase();
      if (storedToken && storedToken === tokenLower) {
        matchedByToken = u;
        break;
      }
    }
    if (matchedByToken) break;
    if (users.length < perPage) break;
    page += 1;
    if (page > 50) break; // himoya
  }

  if (!matchedByToken) {
    throw new Error(
      "MCP havolasi yaroqsiz — token topilmadi. /mcp sahifasidan qayta oling yoki qayta login qiling."
    );
  }

  const storedName = matchedByToken.user_metadata?.name || "";
  // Name case-sensitive: "Muhammadrasul" ≠ "muhammadrasul"
  if (storedName !== name) {
    throw new Error(
      `Name mos kelmadi: havolada "${name}", hisobda "${storedName}". ` +
        `Katta/kichik harflar ham bir xil bo'lishi shart. /mcp sahifasidan to'g'ri havolani oling.`
    );
  }

  return { id: matchedByToken.id, name: storedName };
}

// So'rov qanday foydalanuvchi nomidan bajarilishini aniqlaydi.
// name + token orqali user topiladi; RLS'ni chetlab o'tuvchi service_role
// klient bilan ishlaymiz va HAR BIR so'rovda aniq user_id bilan filtrlaymiz.
async function getAuthedClient(name, token) {
  const user = await resolveUserFromNameAndToken(name, token);
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return { sb, user };
}

// Faylni (agar hali bo'lmasa) public qiladi va web ilovadagi kabi
// "${APP_URL}/?share=TOKEN" ko'rinishidagi doimiy link qaytaradi.
// Fayl allaqachon ochiq va muddati o'tmagan bo'lsa, mavjud tokendan
// foydalanadi (har safar yangi link yaratilavermaydi) — forceNew=true
// bo'lsa eski link bekor qilinib, har doim yangisi yaratiladi.
async function getOrCreateShareUrl(sb, row, expiresInSeconds, forceNew = false) {
  const stillValid =
    !forceNew &&
    row.is_public &&
    row.public_token &&
    (!row.expires_at || new Date(row.expires_at) > new Date());

  if (stillValid) {
    return `${APP_URL}/?share=${row.public_token}`;
  }

  const token = generateToken();
  const expiresAt = expiresInSeconds
    ? new Date(Date.now() + expiresInSeconds * 1000).toISOString()
    : null;

  const { error } = await sb
    .from(TABLE)
    .update({ is_public: true, public_token: token, expires_at: expiresAt })
    .eq("id", row.id);
  if (error) throw new Error(error.message);

  return `${APP_URL}/?share=${token}`;
}

// Fayl nomi bo'yicha eng oxirgi mos qatorni topadi (bir nechta ustunni
// tanlab), yoki topilmasa aniq xato tashlaydi.
async function findFileRow(sb, userId, filename, columns) {
  const { data: row, error } = await sb
    .from(TABLE)
    .select(columns)
    .eq("user_id", userId)
    .eq("filename", filename)
    .order("uploaded_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) throw new Error(`"${filename}" nomli fayl topilmadi.`);
  return row;
}

function buildServer(name, token) {
  const server = new McpServer({ name: "mrdrive", version: "1.2.0" });

  // ---------------------------------------------------------------
  // FAYLLAR
  // ---------------------------------------------------------------

  server.tool(
    "push",
    "Faylni MRdrive'ga yuklaydi (asl Supabase 'files' bucket). Kontent base64 formatida bo'lishi kerak. Fayl web ilovada ham darhol ko'rinadi. Xavfsizlik uchun ba'zi kengaytmalar (.exe, .bat, .sh va h.k.) bloklangan.",
    {
      filename: z.string().describe("Fayl nomi, masalan mrstatus.zip"),
      content_base64: z.string().describe("Fayl kontenti base64 formatida"),
      folder: z
        .string()
        .optional()
        .describe("Fayl joylanadigan papka nomi (ixtiyoriy, mavjud bo'lishi shart emas — avtomatik yaratilmaydi, oldin create_folder chaqiring)"),
    },
    async ({ filename, content_base64, folder }) => {
      if (isBlockedFile(filename)) {
        throw new Error(
          `Bloklangan: "${filename}" — bu fayl turi xavfsizlik sababli ruxsat etilmagan.`
        );
      }

      const { sb, user } = await getAuthedClient(name, token);
      const buffer = Buffer.from(content_base64, "base64");
      const safeName = filename.replace(/[^a-zA-Z0-9_.\-]/g, "_");
      const path = `${user.id}/${Date.now()}_${safeName}`;

      const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buffer, {
        contentType: "application/octet-stream",
      });
      if (upErr) throw new Error(upErr.message);

      const insertData = {
        user_id: user.id,
        filename,
        storage_path: path,
        size: buffer.length,
      };
      if (folder) insertData.folder = folder;

      const { data: inserted, error: dbErr } = await sb
        .from(TABLE)
        .insert(insertData)
        .select("id, is_public, public_token, expires_at")
        .single();
      if (dbErr) throw new Error(dbErr.message);

      const shareUrl = await getOrCreateShareUrl(sb, inserted, null);

      return {
        content: [
          {
            type: "text",
            text: `Yuklandi: ${filename} (${buffer.length} bayt)${folder ? ` [${folder}]` : ""}\nLink: ${shareUrl}`,
          },
        ],
      };
    }
  );

  server.tool(
    "pull",
    "MRdrive'dagi fayl uchun ochiq (mrdrive.vercel.app/?share=...) linkini qaytaradi. Nom bo'yicha eng oxirgi mos faylni topadi. Fayl allaqachon ochiq bo'lsa mavjud linkni qaytaradi.",
    {
      filename: z.string().describe("Yuklab olinadigan fayl nomi"),
      expires_in: z
        .number()
        .optional()
        .describe("Link amal qilish muddati, soniyalarda (default: muddatsiz)"),
    },
    async ({ filename, expires_in }) => {
      const { sb, user } = await getAuthedClient(name, token);
      const row = await findFileRow(sb, user.id, filename, "id, is_public, public_token, expires_at");
      const shareUrl = await getOrCreateShareUrl(sb, row, expires_in || null);
      return { content: [{ type: "text", text: shareUrl }] };
    }
  );

  server.tool(
    "list",
    "MRdrive'dagi fayllar ro'yxatini qaytaradi (web ilovada ko'rinadigan xuddi shu fayllar) — papka, hajm, ochiq/yopiqligi bilan birga. folder berilsa faqat o'sha papkadagilar, folder: \"\" (bo'sh) berilsa faqat papkasiz fayllar chiqadi.",
    {
      folder: z
        .string()
        .optional()
        .describe("Faqat shu papkadagi fayllarni ko'rsatish (ixtiyoriy). Bo'sh satr = papkasiz fayllar."),
    },
    async ({ folder }) => {
      const { sb, user } = await getAuthedClient(name, token);
      let query = sb
        .from(TABLE)
        .select("filename, size, uploaded_at, folder, is_public, public_token, expires_at")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });

      if (folder !== undefined) {
        query = folder === "" ? query.is("folder", null) : query.eq("folder", folder);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      const text = (data || [])
        .map((f) => {
          const parts = [`${f.filename} (${f.size ?? "?"} bayt, ${f.uploaded_at})`];
          if (f.folder) parts.push(`[${f.folder}]`);
          if (f.is_public) {
            const expired = f.expires_at && new Date(f.expires_at) < new Date();
            parts.push(expired ? "[muddati o'tgan link]" : "[ochiq]");
          }
          return parts.join(" ");
        })
        .join("\n");
      return { content: [{ type: "text", text: text || "Fayllar yo'q" }] };
    }
  );

  server.tool(
    "delete",
    "MRdrive'dan faylni butunlay o'chiradi (storage + jadval yozuvi). Nom bo'yicha eng oxirgi mos faylni o'chiradi.",
    {
      filename: z.string().describe("O'chiriladigan fayl nomi"),
    },
    async ({ filename }) => {
      const { sb, user } = await getAuthedClient(name, token);
      const row = await findFileRow(sb, user.id, filename, "id, storage_path");

      const { error: rmErr } = await sb.storage.from(BUCKET).remove([row.storage_path]);
      if (rmErr) throw new Error(rmErr.message);

      const { error: delErr } = await sb.from(TABLE).delete().eq("id", row.id);
      if (delErr) throw new Error(delErr.message);

      return { content: [{ type: "text", text: `O'chirildi: ${filename}` }] };
    }
  );

  server.tool(
    "move_file",
    "Faylni boshqa papkaga ko'chiradi (yoki papkadan chiqaradi). Papka avval create_folder bilan yaratilgan bo'lishi kerak.",
    {
      filename: z.string().describe("Ko'chiriladigan fayl nomi"),
      folder: z
        .string()
        .describe("Maqsad papka nomi. Papkadan chiqarish uchun bo'sh satr (\"\") bering."),
    },
    async ({ filename, folder }) => {
      const { sb, user } = await getAuthedClient(name, token);
      const row = await findFileRow(sb, user.id, filename, "id");

      if (folder) {
        const { data: f, error: fErr } = await sb
          .from(FOLDERS_TABLE)
          .select("id")
          .eq("user_id", user.id)
          .eq("name", folder)
          .maybeSingle();
        if (fErr) throw new Error(fErr.message);
        if (!f) throw new Error(`"${folder}" nomli papka topilmadi. Avval create_folder chaqiring.`);
      }

      const { error } = await sb
        .from(TABLE)
        .update({ folder: folder || null })
        .eq("id", row.id);
      if (error) throw new Error(error.message);

      return {
        content: [
          {
            type: "text",
            text: folder ? `"${filename}" "${folder}" papkasiga ko'chirildi.` : `"${filename}" papkadan chiqarildi.`,
          },
        ],
      };
    }
  );

  // ---------------------------------------------------------------
  // OCHIQ (PUBLIC) LINK BOSHQARUVI
  // ---------------------------------------------------------------

  server.tool(
    "unpublish",
    "Fayl uchun ochiq linkni bekor qiladi (fayl o'zi o'chmaydi, faqat endi share havolasi ishlamay qoladi).",
    {
      filename: z.string().describe("Fayl nomi"),
    },
    async ({ filename }) => {
      const { sb, user } = await getAuthedClient(name, token);
      const row = await findFileRow(sb, user.id, filename, "id");

      const { error } = await sb
        .from(TABLE)
        .update({ is_public: false, public_token: null, expires_at: null })
        .eq("id", row.id);
      if (error) throw new Error(error.message);

      return { content: [{ type: "text", text: `"${filename}" endi ochiq emas — eski link ishlamaydi.` }] };
    }
  );

  server.tool(
    "refresh_link",
    "Fayl uchun eski ochiq linkni bekor qilib, YANGI link yaratadi (eskisi darhol ishlamay qoladi).",
    {
      filename: z.string().describe("Fayl nomi"),
      expires_in: z
        .number()
        .optional()
        .describe("Yangi link amal qilish muddati, soniyalarda (default: muddatsiz)"),
    },
    async ({ filename, expires_in }) => {
      const { sb, user } = await getAuthedClient(name, token);
      const row = await findFileRow(sb, user.id, filename, "id, is_public, public_token, expires_at");
      const shareUrl = await getOrCreateShareUrl(sb, row, expires_in || null, true);
      return { content: [{ type: "text", text: shareUrl }] };
    }
  );

  // ---------------------------------------------------------------
  // PAPKALAR
  // ---------------------------------------------------------------

  server.tool(
    "list_folders",
    "MRdrive'dagi barcha papkalar ro'yxatini qaytaradi.",
    {},
    async () => {
      const { sb, user } = await getAuthedClient(name, token);
      const { data, error } = await sb
        .from(FOLDERS_TABLE)
        .select("name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);

      const text = (data || []).map((f) => f.name).join("\n");
      return { content: [{ type: "text", text: text || "Papkalar yo'q" }] };
    }
  );

  server.tool(
    "create_folder",
    "Yangi papka yaratadi.",
    {
      name: z.string().describe("Yangi papka nomi"),
    },
    async ({ name }) => {
      const trimmed = name.trim();
      if (!trimmed) throw new Error("Papka nomi bo'sh bo'lishi mumkin emas.");

      const { sb, user } = await getAuthedClient(name, token);

      const { data: existing, error: exErr } = await sb
        .from(FOLDERS_TABLE)
        .select("id")
        .eq("user_id", user.id)
        .ilike("name", trimmed);
      if (exErr) throw new Error(exErr.message);
      if (existing && existing.length > 0) {
        throw new Error(`"${trimmed}" nomli papka allaqachon mavjud.`);
      }

      const { error } = await sb.from(FOLDERS_TABLE).insert({ user_id: user.id, name: trimmed });
      if (error) throw new Error(error.message);

      return { content: [{ type: "text", text: `Papka yaratildi: ${trimmed}` }] };
    }
  );

  server.tool(
    "delete_folder",
    "Papkani o'chiradi. Ichidagi fayllar o'chmaydi — ular \"papkasiz\" (All) ro'yxatiga o'tadi.",
    {
      name: z.string().describe("O'chiriladigan papka nomi"),
    },
    async ({ name }) => {
      const { sb, user } = await getAuthedClient(name, token);

      const { data: folder, error: fErr } = await sb
        .from(FOLDERS_TABLE)
        .select("id")
        .eq("user_id", user.id)
        .eq("name", name)
        .maybeSingle();
      if (fErr) throw new Error(fErr.message);
      if (!folder) throw new Error(`"${name}" nomli papka topilmadi.`);

      await sb.from(TABLE).update({ folder: null }).eq("user_id", user.id).eq("folder", name);

      const { error } = await sb.from(FOLDERS_TABLE).delete().eq("id", folder.id);
      if (error) throw new Error(error.message);

      return { content: [{ type: "text", text: `Papka o'chirildi: ${name} (fayllar "papkasiz"ga o'tdi)` }] };
    }
  );

  return server;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Faqat POST so'rovlar qabul qilinadi" });
    return;
  }

  // Ko'p foydalanuvchi: ?name= (identifikatsiya, case-sensitive) + ?token=
  // (username+parol dan ikki marta hash, 48 hex). Server siri yo'q.
  const params = new URL(req.url, "http://localhost").searchParams;
  const name = params.get("name");
  const token = params.get("token");
  if (!token || !name) {
    res.status(401).json({
      error:
        "MCP havolasida ?name= va ?token= kerak. /mcp sahifasidan o'z shaxsiy havolangizni oling.",
    });
    return;
  }

  const server = buildServer(name, token);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on("close", () => {
    transport.close();
    server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "45mb",
    },
  },
};
