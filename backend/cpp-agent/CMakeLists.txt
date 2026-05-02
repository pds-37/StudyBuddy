cmake_minimum_required(VERSION 3.20)
project(studybuddy-agent VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# ── Dependencies via FetchContent ───────────────────────────────────────────────
include(FetchContent)

# nlohmann/json — header-only JSON library
FetchContent_Declare(
  json
  GIT_REPOSITORY https://github.com/nlohmann/json.git
  GIT_TAG        v3.11.3
  GIT_SHALLOW    TRUE
)
FetchContent_MakeAvailable(json)

# yaml-cpp — YAML frontmatter parser
FetchContent_Declare(
  yaml-cpp
  GIT_REPOSITORY https://github.com/jbeder/yaml-cpp.git
  GIT_TAG        0.8.0
  GIT_SHALLOW    TRUE
)
set(YAML_CPP_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(YAML_CPP_BUILD_TOOLS OFF CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(yaml-cpp)

# httplib — header-only C++ HTTP client/server (replaces libcurl for simplicity)
FetchContent_Declare(
  httplib
  GIT_REPOSITORY https://github.com/yhirose/cpp-httplib.git
  GIT_TAG        v0.18.3
  GIT_SHALLOW    TRUE
)
FetchContent_MakeAvailable(httplib)

# ── Source files ────────────────────────────────────────────────────────────────
set(AGENT_SOURCES
  src/main.cpp
  src/cli/command_parser.cpp
  src/cli/repl.cpp
  src/cli/config_loader.cpp
  src/cli/logger.cpp
  src/modules/file_ops.cpp
  src/modules/notes.cpp
  src/sync/sync_client.cpp
  src/sync/offline_queue.cpp
  src/ai/groq_client.cpp
)

add_executable(studybuddy ${AGENT_SOURCES})

target_include_directories(studybuddy PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/src)

target_link_libraries(studybuddy PRIVATE
  nlohmann_json::nlohmann_json
  yaml-cpp::yaml-cpp
  httplib::httplib
)

# Windows: link Winsock for httplib
if(WIN32)
  target_link_libraries(studybuddy PRIVATE ws2_32 crypt32)
endif()
