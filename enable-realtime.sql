-- Run this once in the Supabase SQL editor to turn on Realtime for MRdrive.
-- Without this, app.js's postgres_changes subscription will connect but
-- never actually receive any change events.

alter publication supabase_realtime add table public.files;
alter publication supabase_realtime add table public.folders;

-- Make sure Row Level Security still restricts each user to their own rows
-- (realtime respects RLS policies, so this doesn't leak other users' files).
