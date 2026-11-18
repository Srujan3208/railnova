-- Lock down direct client writes to security-sensitive records.
-- Applied to Supabase project tzxjablcofiixybwbsvc on 2026-11-18.

-- Users may edit profile details, but never their authorization role or system timestamps.
revoke update on table public.profiles from authenticated;
grant update (full_name, username, phone, date_of_birth, avatar_url)
  on table public.profiles to authenticated;

-- Booking rows and their state are created only by trusted server-side workflows.
revoke insert on table public.bookings from authenticated;
drop policy if exists bookings_insert_own on public.bookings;

-- Passengers may mark a notification as read, but cannot rewrite its content or owner.
revoke update on table public.notifications from authenticated;
grant update (read_at) on table public.notifications to authenticated;

-- Complaint submissions may supply content and an optional owned booking reference;
-- status and timestamps remain database controlled.
revoke insert on table public.complaints from authenticated;
grant insert (user_id, booking_id, complaint_type, body)
  on table public.complaints to authenticated;
