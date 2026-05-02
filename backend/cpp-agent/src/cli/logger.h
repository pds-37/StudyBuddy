#pragma once

#include <string>

namespace cli {

enum class LogLevel { INFO, WARN, ERROR };

/** Initializes the log file at ~/.studybuddy/logs/agent.log */
void initLogger(const std::string& data_dir);

/** Logs a message to both stdout and the log file. */
void log(LogLevel level, const std::string& message);

inline void logInfo(const std::string& msg)  { log(LogLevel::INFO, msg); }
inline void logWarn(const std::string& msg)  { log(LogLevel::WARN, msg); }
inline void logError(const std::string& msg) { log(LogLevel::ERROR, msg); }

} // namespace cli
