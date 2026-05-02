#pragma once

#include <string>
#include <nlohmann/json.hpp>

namespace cli {

/** Runtime configuration loaded from ~/.studybuddy/config.json */
struct Config {
  std::string sync_url = "http://localhost:5000";     // Web backend URL
  std::string auth_token;                              // JWT bearer token
  std::string user_id;                                 // Authenticated user ID
  std::string groq_api_key;                            // Groq API key for local AI
  std::string notes_dir;                               // Override for notes directory
  std::string data_dir;                                // ~/.studybuddy base path
};

/** Returns the default data directory: ~/.studybuddy */
std::string getDefaultDataDir();

/** Loads config from ~/.studybuddy/config.json, creating defaults if missing. */
Config loadConfig();

/** Saves the current config back to disk. */
void saveConfig(const Config& config);

/** Converts config to/from JSON. */
void to_json(nlohmann::json& j, const Config& c);
void from_json(const nlohmann::json& j, Config& c);

} // namespace cli
