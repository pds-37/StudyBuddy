#include "logger.h"
#include <iostream>
#include <fstream>
#include <chrono>
#include <iomanip>
#include <filesystem>
#include <mutex>

namespace cli {

static std::ofstream g_log_file;
static std::mutex g_log_mutex;

static std::string timestamp() {
  auto now = std::chrono::system_clock::now();
  auto time = std::chrono::system_clock::to_time_t(now);
  std::tm tm_buf{};
#ifdef _WIN32
  localtime_s(&tm_buf, &time);
#else
  localtime_r(&time, &tm_buf);
#endif
  std::ostringstream oss;
  oss << std::put_time(&tm_buf, "%Y-%m-%d %H:%M:%S");
  return oss.str();
}

static const char* levelStr(LogLevel level) {
  switch (level) {
    case LogLevel::INFO:  return "INFO";
    case LogLevel::WARN:  return "WARN";
    case LogLevel::ERROR: return "ERROR";
  }
  return "???";
}

void initLogger(const std::string& data_dir) {
  auto log_dir = std::filesystem::path(data_dir) / "logs";
  std::filesystem::create_directories(log_dir);

  auto log_path = log_dir / "agent.log";
  g_log_file.open(log_path, std::ios::app);

  if (!g_log_file.is_open()) {
    std::cerr << "[logger] Failed to open log file: " << log_path.string() << "\n";
  }
}

void log(LogLevel level, const std::string& message) {
  std::lock_guard<std::mutex> lock(g_log_mutex);

  auto ts = timestamp();
  auto lvl = levelStr(level);

  // Console output
  if (level == LogLevel::ERROR) {
    std::cerr << "[" << lvl << "] " << message << "\n";
  } else {
    std::cout << "[" << lvl << "] " << message << "\n";
  }

  // File output
  if (g_log_file.is_open()) {
    g_log_file << ts << " [" << lvl << "] " << message << "\n";
    g_log_file.flush();
  }
}

} // namespace cli
