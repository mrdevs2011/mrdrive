-- OPTIONAL. app.js now polls every 2s on its own, so the app works live
-- without this. Run this ONLY if you do have Supabase dashboard/SQL access
-- and want true push-based updates (sub-second instead of up to ~2s):

alter publication supabase_realtime add table public.files;
alter publication supabase_realtime add table public.folders;

-- Realtime still respects your existing Row Level Security policies, so
-- this doesn't leak other users' files.
