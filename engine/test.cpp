#include "engine.hpp"
#include <atomic>
#include <cstdio>
#include <thread>
using namespace rb;
static int fails = 0;
#define CHECK(c) do { if (!(c)) { std::printf("FAIL line %d: %s\n", __LINE__, #c); ++fails; } } while (0)
int main() {
  { // 1) 400 threads race for the same seat with different idempotency keys: exactly one wins
    BookingEngine e; std::atomic<int> won{0}, taken{0}; std::vector<std::thread> th;
    for (int i = 0; i < 400; ++i) th.emplace_back([&, i] { auto r = e.hold("k" + std::to_string(i), {"T1|2026-11-20|S1|14"}, Ms(600000));
      (r.status == Status::Ok ? won : taken)++; });
    for (auto& t : th) t.join();
    CHECK(won == 1); CHECK(taken == 399); }
  { // 2) overlapping multi-seat requests never deadlock and never double-book
    BookingEngine e; std::atomic<int> ok{0}; std::vector<std::thread> th;
    for (int i = 0; i < 200; ++i) th.emplace_back([&, i] {
      std::vector<std::string> s = (i % 2) ? std::vector<std::string>{"T|d|S1|1", "T|d|S1|2", "T|d|S1|3"} : std::vector<std::string>{"T|d|S1|3", "T|d|S1|2", "T|d|S1|1"};
      if (e.hold("m" + std::to_string(i), s, Ms(60000)).status == Status::Ok) ok++; });
    for (auto& t : th) t.join(); CHECK(ok == 1); }
  { // 3) double tap / retry with the same idempotency key returns the same hold
    BookingEngine e; auto a = e.hold("same", {"T|d|S1|9"}, Ms(1000)); auto b = e.hold("same", {"T|d|S1|9"}, Ms(1000));
    CHECK(a.status == Status::Ok); CHECK(b.status == Status::Duplicate); CHECK(a.holdId == b.holdId); }
  { // 4) hold expiry frees the seat; late confirm is rejected; confirm is single-shot
    auto t0 = Clock::now(); Clock::time_point cur = t0; BookingEngine e([&] { return cur; });
    auto a = e.hold("a", {"T|d|S1|5"}, Ms(1000)); CHECK(e.hold("b", {"T|d|S1|5"}, Ms(1000)).status == Status::SeatTaken);
    cur = t0 + Ms(1500); CHECK(e.confirm(a.holdId) == Status::HoldExpired);
    auto c = e.hold("c", {"T|d|S1|5"}, Ms(1000)); CHECK(c.status == Status::Ok);
    CHECK(e.confirm(c.holdId) == Status::Ok); CHECK(e.confirm(c.holdId) == Status::Duplicate);
    CHECK(e.hold("d", {"T|d|S1|5"}, Ms(1000)).status == Status::SeatTaken);        // booked seat stays taken
    e.release(c.holdId); CHECK(e.hold("e", {"T|d|S1|5"}, Ms(1000)).status == Status::Ok); }  // cancellation frees it
  { // 5) all-or-nothing: one taken seat in the request blocks the whole hold
    BookingEngine e; e.hold("x", {"T|d|S1|2"}, Ms(1000));
    auto r = e.hold("y", {"T|d|S1|1", "T|d|S1|2"}, Ms(1000)); CHECK(r.status == Status::SeatTaken);
    CHECK(e.hold("z", {"T|d|S1|1"}, Ms(1000)).status == Status::Ok); }
  { // 6) rate limiter: burst of 5, then blocked, then refills over time; keys are independent
    auto t0 = Clock::now(); Clock::time_point cur = t0; RateLimiter rl(5, 1.0, [&] { return cur; }); int ok = 0;
    for (int i = 0; i < 20; ++i) ok += rl.allow("ip1"); CHECK(ok == 5); CHECK(rl.allow("ip2"));
    cur = t0 + std::chrono::seconds(2); CHECK(rl.allow("ip1")); CHECK(rl.allow("ip1")); CHECK(!rl.allow("ip1")); }
  std::printf(fails ? "%d FAILED\n" : "ALL TESTS PASSED\n", fails); return fails != 0;
}