import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "files";
const TABLE = "files";
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

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
async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === "string") return Buffer.from(req.body);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Room-Token, X-Filename, X-Guest-Name"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "POST only" });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: "Server misconfigured" });
    return;
  }

  const roomToken = (req.headers["x-room-token"] || "").toString().trim();
  const filename = (req.headers["x-filename"] || "").toString().trim();
  let guestName = (req.headers["x-guest-name"] || "").toString().trim().slice(0, 40);
  if (!guestName) guestName = "Anonim";

  if (!roomToken || !/^[0-9a-f]{16,64}$/i.test(roomToken)) {
    res.status(400).json({ error: "Invalid room token" });
    return;
  }
  if (!filename) {
    res.status(400).json({ error: "X-Filename required" });
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

    const { data: roomRows, error: roomErr } = await sb
      .from("rooms")
      .select("id, owner_id, public_token, name")
      .eq("public_token", roomToken)
      .limit(1);
    if (roomErr) throw new Error(roomErr.message);
    const room = roomRows && roomRows[0];
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const buffer = await readRawBody(req);
    if (!buffer.length) {
      res.status(400).json({ error: "empty body" });
      return;
    }
    if (buffer.length > MAX_BYTES) {
      res.status(400).json({ error: "File too large (max 50 MB)" });
      return;
    }

    const safeName = filename.replace(/[^a-zA-Z0-9_.\-]/g, "_");
    const anonId = crypto.randomBytes(8).toString("hex");
    const path = `rooms/${room.public_token}/${room.owner_id}/anon/${anonId}/${Date.now()}_${safeName}`;

    const { error: upErr } = await sb.storage.from(BUCKET).upload(path, buffer, {
      contentType: getContentType(filename),
      upsert: false,
    });
    if (upErr) throw new Error(upErr.message);

    // user_id = room owner (FK NOT NULL). uploader_username marks guest.
    const insertData = {
      user_id: room.owner_id,
      filename,
      storage_path: path,
      size: buffer.length,
      room_id: room.id,
      uploader_username: guestName,
    };

    const { data: inserted, error: dbErr } = await sb
      .from(TABLE)
      .insert(insertData)
      .select("id, filename, storage_path, size, uploaded_at, room_id, uploader_username, user_id")
      .single();
    if (dbErr) {
      await sb.storage.from(BUCKET).remove([path]).catch(() => {});
      throw new Error(dbErr.message);
    }

    res.status(200).json({ ok: true, file: inserted });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
