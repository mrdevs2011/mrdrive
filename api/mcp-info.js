// Diagnostika uchun: shaxsiy ma'lumot qaytarmaydi, faqat kerakli
// Environment Variable'lar to'liq kiritilganini tekshiradi.
// MCP_TOKEN_SECRET endi KERAK EMAS — token username+parol dan lokal hisoblanadi.
export default function handler(req, res) {
  const hasCredentials = Boolean(
    process.env.SUPABASE_URL &&
      process.env.SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ hasCredentials });
}
