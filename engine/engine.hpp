// RailBook booking core: sharded seat store, time-limited holds, idempotent requests, token-bucket rate limiter.
// Header-only, C++17. The HTTP layer (Drogon) and PostgreSQL/Redis persistence wrap these exact rules in Stage 4.
#pragma once
#include <algorithm>
#include <chrono>
#include <functional>
#include <mutex>
#include <string>
#include <unordered_map>
#include <vector>

namespace rb {
using Clock = std::chrono::steady_clock;
using Ms = std::chrono::milliseconds;

enum class Status { Ok, SeatTaken, Duplicate, RateLimited, HoldExpired, NotFound };
struct Result { Status status; std::string holdId; std::string failedSeat; };

// seat key = "train|date|coach|berth"
class BookingEngine {
  static constexpr size_t kShards = 64;
  enum class St { Free, Held, Booked };
  struct Seat { St st = St::Free; std::string hold; Clock::time_point exp; };
  struct Shard { std::mutex m; std::unordered_map<std::string, Seat> seats; };
  struct Hold { std::vector<std::string> seats; Clock::time_point exp; bool confirmed = false; };
  Shard shards_[kShards];
  std::mutex hm_;                                   // guards holds_ and idem_
  std::unordered_map<std::string, Hold> holds_;
  std::unordered_map<std::string, Result> idem_;    // idempotency key -> first result
  std::function<Clock::time_point()> now_;
  uint64_t seq_ = 0;

  static size_t shardOf(const std::string& k) { return std::hash<std::string>{}(k) % kShards; }

 public:
  explicit BookingEngine(std::function<Clock::time_point()> now = Clock::now) : now_(std::move(now)) {}

  // Atomically hold ALL requested seats or none. Same idempotency key => same answer, never a second hold.
  Result hold(const std::string& idemKey, std::vector<std::string> seats, Ms ttl) {
    { std::lock_guard<std::mutex> g(hm_); auto it = idem_.find(idemKey);
      if (it != idem_.end()) return {Status::Duplicate, it->second.holdId, ""}; }
    std::sort(seats.begin(), seats.end()); seats.erase(std::unique(seats.begin(), seats.end()), seats.end());
    std::vector<size_t> order;                       // lock shards in ascending order => no deadlock
    for (auto& s : seats) order.push_back(shardOf(s));
    std::sort(order.begin(), order.end()); order.erase(std::unique(order.begin(), order.end()), order.end());
    std::vector<std::unique_lock<std::mutex>> locks;
    for (size_t i : order) locks.emplace_back(shards_[i].m);
    auto t = now_();
    for (auto& s : seats) {                          // check phase
      Seat& x = shards_[shardOf(s)].seats[s];
      if (x.st == St::Held && x.exp <= t) x.st = St::Free;      // lazy expiry
      if (x.st != St::Free) return {Status::SeatTaken, "", s};
    }
    std::string id; { std::lock_guard<std::mutex> g(hm_); id = "H" + std::to_string(++seq_);
      holds_[id] = {seats, t + ttl, false}; }
    for (auto& s : seats) { Seat& x = shards_[shardOf(s)].seats[s]; x = {St::Held, id, t + ttl}; }
    Result r{Status::Ok, id, ""};
    std::lock_guard<std::mutex> g(hm_); idem_[idemKey] = r;
    return r;
  }

  // Called only after the payment gateway webhook is verified.
  Status confirm(const std::string& holdId) {
    std::vector<std::string> seats; Clock::time_point exp;
    { std::lock_guard<std::mutex> g(hm_); auto it = holds_.find(holdId);
      if (it == holds_.end()) return Status::NotFound;
      if (it->second.confirmed) return Status::Duplicate;
      seats = it->second.seats; exp = it->second.exp; }
    std::vector<size_t> order; for (auto& s : seats) order.push_back(shardOf(s));
    std::sort(order.begin(), order.end()); order.erase(std::unique(order.begin(), order.end()), order.end());
    std::vector<std::unique_lock<std::mutex>> locks; for (size_t i : order) locks.emplace_back(shards_[i].m);
    if (now_() >= exp) return Status::HoldExpired;
    for (auto& s : seats) { Seat& x = shards_[shardOf(s)].seats[s]; if (x.st != St::Held || x.hold != holdId) return Status::HoldExpired; }
    for (auto& s : seats) shards_[shardOf(s)].seats[s].st = St::Booked;
    std::lock_guard<std::mutex> g(hm_); holds_[holdId].confirmed = true; return Status::Ok;
  }

  // Payment failed or user cancelled: free held seats, or release booked seats on cancellation.
  void release(const std::string& holdId) {
    std::vector<std::string> seats;
    { std::lock_guard<std::mutex> g(hm_); auto it = holds_.find(holdId); if (it == holds_.end()) return; seats = it->second.seats; holds_.erase(it); }
    for (auto& s : seats) { auto& sh = shards_[shardOf(s)]; std::lock_guard<std::mutex> g(sh.m);
      auto it = sh.seats.find(s); if (it != sh.seats.end() && it->second.hold == holdId) it->second = Seat{}; }
  }
};

// Token bucket per key (IP, user id, "login:IP"...). Sharded to stay fast under load.
class RateLimiter {
  struct B { double tokens; Clock::time_point last; };
  struct Sh { std::mutex m; std::unordered_map<std::string, B> b; };
  Sh sh_[32]; double cap_, perSec_; std::function<Clock::time_point()> now_;
 public:
  RateLimiter(double burst, double perSecond, std::function<Clock::time_point()> now = Clock::now) : cap_(burst), perSec_(perSecond), now_(std::move(now)) {}
  bool allow(const std::string& key) {
    auto& s = sh_[std::hash<std::string>{}(key) % 32]; std::lock_guard<std::mutex> g(s.m); auto t = now_();
    auto it = s.b.try_emplace(key, B{cap_, t}).first; B& b = it->second;
    b.tokens = std::min(cap_, b.tokens + std::chrono::duration<double>(t - b.last).count() * perSec_); b.last = t;
    if (b.tokens < 1.0) return false; b.tokens -= 1.0; return true;
  }
};
}  // namespace rb