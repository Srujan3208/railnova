-- Align SQL table grants with the existing RLS policies.
-- RLS remains the row-level security boundary; these grants provide defense in depth.
-- service_role grants are intentionally unchanged.

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM authenticated;

-- Public catalogue data only.
GRANT SELECT ON TABLE
  public.stations,
  public.trains,
  public.train_stops,
  public.train_classes
TO anon;

-- Authenticated users may read rows, but row ownership remains enforced by RLS.
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant only the writes that have matching owner-scoped RLS policies today.
GRANT INSERT ON TABLE public.bookings TO authenticated;
GRANT INSERT ON TABLE public.complaints TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.saved_passengers TO authenticated;
GRANT UPDATE ON TABLE public.profiles TO authenticated;
GRANT UPDATE ON TABLE public.notifications TO authenticated;

-- Do not automatically grant broad table access to these client roles on new tables.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
