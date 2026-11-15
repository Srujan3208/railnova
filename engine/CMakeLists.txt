cmake_minimum_required(VERSION 3.16)
project(railbook_backend CXX)
set(CMAKE_CXX_STANDARD 17)
add_executable(engine_tests test.cpp)
find_package(Threads REQUIRED)
target_link_libraries(engine_tests Threads::Threads)
enable_testing()
add_test(NAME engine COMMAND engine_tests)
# Stage 4 adds: find_package(Drogon) + the HTTP/WebSocket server target that links engine.hpp
