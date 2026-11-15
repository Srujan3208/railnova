# RailBook backend (Stage 3: booking core)
- `engine.hpp`  seat store (64 shards), all-or-nothing time-limited holds, idempotent requests, token-bucket rate limiter
- `test.cpp`    400-thread same-seat race, overlapping multi-seat requests, retries, expiry, cancellation, rate limit refill
- `schema.sql`  PostgreSQL schema; seats PRIMARY KEY (train, date, coach, berth) + UNIQUE(user, idempotency_key)

Build and test: `g++ -std=c++17 -O2 -pthread test.cpp -o tests && ./tests`  (or `cmake -B build && cmake --build build && ctest --test-dir build`)
Stage 4 wraps these rules in Drogon endpoints, PostgreSQL transactions (SELECT ... FOR UPDATE) and Redis.
