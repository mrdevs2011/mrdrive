import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const APP_URL = (process.env.APP_URL || "https://mrdrive.vercel.app").replace(/\/+$/, "");
const BUCKET = "files";
const TABLE = "files";

const BLOCKED_EXTENSIONS = [
  "exe", "bat", "cmd", "sh", "msi", "com", "scr",
  "vbs", "js", "jar", "ps1", "app", "dmg", "apk",
];

const MIME_TYPES = {
  svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  gif: "image/gif", webp: "image/webp", bmp: "image/bmp", avif: "image/avif", ico: "image/x-icon",
  mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg",
  pdf: "application/pdf", txt: "text/plain", csv: "text/csv",
  json: "application/json", html: "text/html", css: "text/css",
  zip: "application/zip",
};

function isBlockedFile(filename) {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  return BLOCKED_EXTENSIONS.includes(ext);
}
function getContentType(filename) {
  const ext = (filename.split(".").pop() || "").toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}
function extractAuth(req) {
  const params = new URL(req.url, "http://localhost").searchParams;
  const auth = req.headers["authorization"] || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const headerToken = (req.headers["x-mcp-token"] || "").toString().trim();
  const headerName = (req.headers["x-mcp-name"] || "").toString().trim();
  const token = bearer || headerToken || params.get("token") || "";
  const name = headerName || params.get("name") || "";
  return { name, token };
}
async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Authorization, X-MCP-Name, X-MCP-Token, X-Filename, X-Folder, Content-Type");
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  const { name, token } = extractAuth(req);
  if (!name || !token) {
    res.status(401).json({ error: "Authorization: Bearer <token> + X-MCP-Name required" });
    return;
  }
  if (!/^[0-9a-f]{48}$/i.test(token)) {
    res.status(401).json({ error: "token must be 48 hex chars" });
    return;
  }

  const params = new URL(req.url, "http://localhost").searchParams;
  const filename = (req.headers["x-filename"] || params.get("filename") || "").toString().trim();
  const folder = (req.headers["x-folder"] || params.get("folder") || "").toString().trim();
  if (!filename) {
    res.status(400).json({ error: "X-Filename or ?filename= required" });
    return;
  }
  if (isBlockedFile(filename)) {
    res.status(400).json({ error: `blocked type: ${filename}` });
    return;
  }

  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: uid, error: authErr } = await sb.rpc("resolve_mcp_user", {
      p_name: name,
      p_token: token.toLowerCase(),
    });
    if (authErr) throw new Error("Auth lookup failed: " + authErr.message);
    if (!uid) {
      res.status(401).json({ error: "invalid name/token" });
      return;
    }

    const buffer = await readRawBody(req);
    if (!buffer.length) {
      res.status(400).json({ error: "empty body" });
      return;
    }

    const safeName = filename.replace(/[^a-zA-Z0-9_.\-]/g, "_");
    const path = `${uid}/${Date.now()}_${safeName}`;
    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buffer, {
      contentType: getContentType(filename),
    });
    if (upErr) throw new Error(upErr.message);

    const insertData = {
      user_id: uid,
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

    const tokenShare = crypto.randomBytes(16).toString("hex");
    const stillValid =
      inserted.is_public &&
      inserted.public_token &&
      (!inserted.expires_at || new Date(inserted.expires_at) > new Date());
    let shareToken = inserted.public_token;
    if (!stillValid) {
      const { error } = await sb
        .from(TABLE)
        .update({ is_public: true, public_token: tokenShare, expires_at: null })
        .eq("id", inserted.id);
      if (error) throw new Error(error.message);
      shareToken = tokenShare;
    }
    const shareUrl = `${APP_URL}/?share=${shareToken}`;
    res.status(200).json({
      ok: true,
      filename,
      bytes: buffer.length,
      folder: folder || null,
      link: shareUrl,
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
