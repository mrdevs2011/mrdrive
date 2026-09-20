// ==========================================
// BU YERGA O'ZINING SUPABASE MA'LUMOTLARINGNI QO'Y
// Supabase Dashboard -> Settings -> API
// ==========================================

const SUPABASE_URL = "https://hharvpgnqmjbbgnfsauq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_enRXsK8Yqzn_goNRUHBocg_DPvuWUDb";

// Bu ikkalasi PUBLIC bo'lishi mumkin - xavfsizlik RLS orqali ta'minlanadi
// SERVICE_ROLE key'ni HECH QACHON bu yerga yoki frontendga qo'yma!

// Supabase'ga to'g'ridan-to'g'ri kira olmasang (masalan bloklangan bo'lsa):
// mrdrive-proxy loyihasini Vercel'ga deploy qil, keyin SUPABASE_URL'ni
// shu proxy manziliga almashtir (SUPABASE_ANON_KEY o'zgarmaydi).
// Batafsil: mrdrive-proxy/README.md
