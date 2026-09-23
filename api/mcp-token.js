// Har bir MRdrive foydalanuvchisi uchun DOIMIY, shaxsiy MCP token.
//
// Token server siri (MCP_TOKEN_SECRET) O'RNIGA username + parol dan
// lokal (brauzer)da hisoblanadi va user_metadata.mcp_token ga yoziladi.
//
// Formula (Node va brauzerda bir xil):
//   uHash = sha256(username)          // 64 hex
//   pHash = sha256(password)          // 64 hex
//   token = sha256(uHash + pHash)[:48] // 48 hex — ikki marta hash, qisqa URL
//
// Bu endpoint endi faqat login qilingan sessiyadan name + mcp_token ni
// o'qib, tayyor URL qaytaradi. Token yaratish /mcp sahifasida yoki
// signup/login paytida brauzerda bo'ladi.
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

/** Username + parol dan 48 hex MCP token. Brauzerdagi computeMcpToken bilan bir xil. */
export function computeMcpToken(username, password) {
  const uHash = crypto.createHash("sha256").update(String(username), "utf8").digest("hex");
  const pHash = crypto.createHash("sha256").update(String(password), "utf8").digest("hex");
  return crypto.createHash("sha256").update(uHash + pHash, "utf8").digest("hex").slice(0, 48);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    res.status(500).json({ error: "Server sozlanmagan: SUPABASE_URL / SUPABASE_ANON_KEY yo'q." });
    return;
  }

  const authHeader = req.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!accessToken) {
    res.status(401).json({ error: "Avval MRdrive'ga tizimga kiring." });
    return;
  }

  try {
    const sbAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sbAuth.auth.getUser(accessToken);
    if (error || !data?.user) {
      res.status(401).json({ error: "Sessiya yaroqsiz — qayta tizimga kiring." });
      return;
    }

    const meta = data.user.user_metadata || {};
    const name = meta.name || meta.username || "";
    const token = meta.mcp_token || "";

    if (!token || !/^[0-9a-f]{48}$/i.test(token)) {
      res.status(400).json({
        error: "mcp_token topilmadi. /mcp sahifasida username va parolni qayta kiriting yoki qayta login qiling.",
        needsPassword: true,
        name,
        username: meta.username || "",
      });
      return;
    }

    if (!name) {
      res.status(400).json({ error: "Hisobda name yo'q. Qayta ro'yxatdan o'ting." });
      return;
    }

    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    // name URL-encoded — Claude'da bir nechta account ajratish uchun
    const mcpUrl = `${proto}://${host}/api/mcp?name=${encodeURIComponent(name)}&token=${token}`;

    res.status(200).json({ mcpUrl, token, name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
