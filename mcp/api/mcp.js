import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import crypto from "crypto";

// Bular MRdrive'ning o'z frontend config.js'idagi bilan bir xil, ochiq
// (public) qiymatlar — service_role kalit emas, xavfsiz.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const FAKE_EMAIL_DOMAIN = "mrdrive.local";

// MRdrive web ilovasi qaysi domenda turibdi — pull/push qaytaradigan
// link shu domenga ?share=TOKEN qo'shib hosil qilinadi (xom Supabase
// signed URL emas). Kerak bo'lsa Vercel env var orqali override qiling.
const APP_URL = (process.env.APP_URL || "https://mrdrive.vercel.app").replace(/\/+$/, "");

// MRdrive ilovasidagi (Supabase dashboard emas!) shaxsiy username/parol —
// xuddi brauzerda login qilganingizdagi kabi.
const MRDRIVE_USERNAME = process.env.MRDRIVE_USERNAME;
const MRDRIVE_PASSWORD = process.env.MRDRIVE_PASSWORD;

const BUCKET = "files";
const TABLE = "files";

// Web ilovadagi generateToken() bilan bir xil format (32 hex belgi).
function generateToken() {
  return crypto.randomBytes(16).toString("hex");
}

// Faylni (agar hali bo'lmasa) public qiladi va web ilovadagi kabi
// "${APP_URL}/?share=TOKEN" ko'rinishidagi doimiy link qaytaradi.
// Fayl allaqachon ochiq va muddati o'tmagan bo'lsa, mavjud tokendan
// foydalanadi (har safar yangi link yaratilavermaydi).
async function getOrCreateShareUrl(sb, row, expiresInSeconds) {
  const stillValid =
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

function usernameToEmail(username) {
  return (
    username.trim().toLowerCase().replace(/[^a-z0-9_.-]/g, "") +
    "@" +
    FAKE_EMAIL_DOMAIN
  );
}

// Har so'rovda MRdrive foydalanuvchisi sifatida tizimga kiradi (xuddi
// brauzerdagi login kabi) — shu orqali Supabase RLS o'z-o'zidan ishlaydi,
// service_role kalit shart emas.
async function getAuthedClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "SUPABASE_URL yoki SUPABASE_ANON_KEY environment variable topilmadi."
    );
  }
  if (!MRDRIVE_USERNAME || !MRDRIVE_PASSWORD) {
    throw new Error(
      "MRDRIVE_USERNAME yoki MRDRIVE_PASSWORD environment variable topilmadi."
    );
  }

  const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data, error } = await sb.auth.signInWithPassword({
    email: usernameToEmail(MRDRIVE_USERNAME),
    password: MRDRIVE_PASSWORD,
  });
  if (error) throw new Error("MRdrive login xato: " + error.message);

  return { sb, user: data.user };
}

function buildServer() {
  const server = new McpServer({ name: "mrdrive", version: "1.0.0" });

  server.tool(
    "push",
    "Faylni MRdrive'ga (asl Supabase 'files' bucket) yuklaydi. Kontent base64 formatida bo'lishi kerak. Fayl web ilovada ham darhol ko'rinadi.",
    {
      filename: z.string().describe("Fayl nomi, masalan mrstatus.zip"),
      content_base64: z.string().describe("Fayl kontenti base64 formatida"),
    },
    async ({ filename, content_base64 }) => {
      const { sb, user } = await getAuthedClient();
      const buffer = Buffer.from(content_base64, "base64");
      const safeName = filename.replace(/[^a-zA-Z0-9_.\-]/g, "_");
      const path = `${user.id}/${Date.now()}_${safeName}`;

      const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buffer, {
        contentType: "application/octet-stream",
      });
      if (upErr) throw new Error(upErr.message);

      const { data: inserted, error: dbErr } = await sb
        .from(TABLE)
        .insert({
          user_id: user.id,
          filename,
          storage_path: path,
          size: buffer.length,
        })
        .select("id, is_public, public_token, expires_at")
        .single();
      if (dbErr) throw new Error(dbErr.message);

      const shareUrl = await getOrCreateShareUrl(sb, inserted, null);

      return {
        content: [
          {
            type: "text",
            text: `Yuklandi: ${filename} (${buffer.length} bayt)\nLink: ${shareUrl}`,
          },
        ],
      };
    }
  );

  server.tool(
    "pull",
    "MRdrive'dagi fayl uchun ochiq (mrdrive.vercel.app/?share=...) linkini qaytaradi. Nom bo'yicha eng oxirgi mos faylni topadi.",
    {
      filename: z.string().describe("Yuklab olinadigan fayl nomi"),
      expires_in: z
        .number()
        .optional()
        .describe("Link amal qilish muddati, soniyalarda (default: muddatsiz)"),
    },
    async ({ filename, expires_in }) => {
      const { sb, user } = await getAuthedClient();
      const { data: row, error: qErr } = await sb
        .from(TABLE)
        .select("id, is_public, public_token, expires_at")
        .eq("user_id", user.id)
        .eq("filename", filename)
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (qErr) throw new Error(qErr.message);
      if (!row) throw new Error(`"${filename}" nomli fayl topilmadi.`);

      const shareUrl = await getOrCreateShareUrl(sb, row, expires_in || null);

      return { content: [{ type: "text", text: shareUrl }] };
    }
  );

  server.tool(
    "list",
    "MRdrive'dagi barcha fayllar ro'yxatini qaytaradi (web ilovada ko'rinadigan xuddi shu fayllar).",
    {},
    async () => {
      const { sb, user } = await getAuthedClient();
      const { data, error } = await sb
        .from(TABLE)
        .select("filename, size, uploaded_at")
        .eq("user_id", user.id)
        .order("uploaded_at", { ascending: false });
      if (error) throw new Error(error.message);

      const text = (data || [])
        .map((f) => `${f.filename} (${f.size ?? "?"} bayt, ${f.uploaded_at})`)
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
      const { sb, user } = await getAuthedClient();
      const { data: row, error: qErr } = await sb
        .from(TABLE)
        .select("id, storage_path")
        .eq("user_id", user.id)
        .eq("filename", filename)
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (qErr) throw new Error(qErr.message);
      if (!row) throw new Error(`"${filename}" nomli fayl topilmadi.`);

      const { error: rmErr } = await sb.storage.from(BUCKET).remove([row.storage_path]);
      if (rmErr) throw new Error(rmErr.message);

      const { error: delErr } = await sb.from(TABLE).delete().eq("id", row.id);
      if (delErr) throw new Error(delErr.message);

      return { content: [{ type: "text", text: `O'chirildi: ${filename}` }] };
    }
  );

  return server;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Faqat POST so'rovlar qabul qilinadi" });
    return;
  }

  const server = buildServer();
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
