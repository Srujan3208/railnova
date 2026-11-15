# Database migrations

The RAILNOVA Supabase project (`tzxjablcofiixybwbsvc`, Mumbai) has already been provisioned and verified through the Supabase management connection.

Do not run the retired prototype migration from earlier ZIP versions. It used an earlier schema and would conflict with the live database.

The live schema includes profiles, stations, trains, train_stops, train_classes, saved_passengers, bookings, booking_passengers, seats, payments, refunds, complaints, notifications and audit_log. All exposed tables have RLS enabled. Booking/payment writes are reserved for trusted server-side functions.
