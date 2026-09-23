import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Bular MRdrive'ning o'z frontend config.js'idagi bilan bir xil, ochiq
// (public) qiymatlar — service_role kalit emas, xavfsiz.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const FAKE_EMAIL_DOMAIN = "mrdrive.local";

// MRdrive ilovasidagi (Supabase dashboard emas!) shaxsiy username/parol —
// xuddi brauzerda login qilganingizdagi kabi.
const MRDRIVE_USERNAME = process.env.MRDRIVE_USERNAME;
const MRDRIVE_PASSWORD = process.env.MRDRIVE_PASSWORD;

const BUCKET = "files";
const TABLE = "files";

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

      const { error: dbErr } = await sb.from(TABLE).insert({
        user_id: user.id,
        filename,
        storage_path: path,
        size: buffer.length,
      });
      if (dbErr) throw new Error(dbErr.message);

      const { data: signed, error: signErr } = await sb.storage
        .from(BUCKET)
        .createSignedUrl(path, 3600);
      if (signErr) throw new Error(signErr.message);

      return {
        content: [
          {
            type: "text",
            text: `Yuklandi: ${filename} (${buffer.length} bayt)\nURL (1 soat amal qiladi): ${signed.signedUrl}`,
          },
        ],
      };
    }
  );

  server.tool(
    "pull",
    "MRdrive'dagi fayl uchun vaqtinchalik yuklab olish linkini (signed URL) qaytaradi. Nom bo'yicha eng oxirgi mos faylni topadi.",
    {
      filename: z.string().describe("Yuklab olinadigan fayl nomi"),
      expires_in: z
        .number()
        .optional()
        .describe("Link amal qilish muddati, soniyalarda (default: 3600)"),
    },
    async ({ filename, expires_in }) => {
      const { sb, user } = await getAuthedClient();
      const { data: row, error: qErr } = await sb
        .from(TABLE)
        .select("storage_path")
        .eq("user_id", user.id)
        .eq("filename", filename)
        .order("uploaded_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (qErr) throw new Error(qErr.message);
      if (!row) throw new Error(`"${filename}" nomli fayl topilmadi.`);

      const { data: signed, error: signErr } = await sb.storage
        .from(BUCKET)
        .createSignedUrl(row.storage_path, expires_in || 3600);
      if (signErr) throw new Error(signErr.message);

      return { content: [{ type: "text", text: signed.signedUrl }] };
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
