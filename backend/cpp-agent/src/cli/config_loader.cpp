#include "config_loader.h"
#include <fstream>
#include <filesystem>
#include <iostream>

namespace fs = std::filesystem;

namespace cli {

void to_json(nlohmann::json& j, const Config& c) {
  j = nlohmann::json{
    {"sync_url",     c.sync_url},
    {"auth_token",   c.auth_token},
    {"user_id",      c.user_id},
    {"groq_api_key", c.groq_api_key},
    {"notes_dir",    c.notes_dir},
    {"data_dir",     c.data_dir}
  };
}

void from_json(const nlohmann::json& j, Config& c) {
  if (j.contains("sync_url"))     j.at("sync_url").get_to(c.sync_url);
  if (j.contains("auth_token"))   j.at("auth_token").get_to(c.auth_token);
  if (j.contains("user_id"))      j.at("user_id").get_to(c.user_id);
  if (j.contains("groq_api_key")) j.at("groq_api_key").get_to(c.groq_api_key);
  if (j.contains("notes_dir"))    j.at("notes_dir").get_to(c.notes_dir);
  if (j.contains("data_dir"))     j.at("data_dir").get_to(c.data_dir);
}

std::string getDefaultDataDir() {
#ifdef _WIN32
  const char* home = std::getenv("USERPROFILE");
#else
  const char* home = std::getenv("HOME");
#endif
  if (!home) {
    return ".studybuddy";
  }
  return (fs::path(home) / ".studybuddy").string();
}

Config loadConfig() {
  Config config;
  config.data_dir = getDefaultDataDir();

  fs::path config_path = fs::path(config.data_dir) / "config.json";

  // Create directory structure if missing
  fs::create_directories(config.data_dir);
  fs::create_directories(fs::path(config.data_dir) / "notes");
  fs::create_directories(fs::path(config.data_dir) / "logs");
  fs::create_directories(fs::path(config.data_dir) / "cache");
  fs::create_directories(fs::path(config.data_dir) / "trash");
  fs::create_directories(fs::path(config.data_dir) / "prompts");
  fs::create_directories(fs::path(config.data_dir) / "queue");

  if (fs::exists(config_path)) {
    try {
      std::ifstream file(config_path);
      auto j = nlohmann::json::parse(file);
      config = j.get<Config>();
    } catch (const std::exception& e) {
      std::cerr << "[config] Failed to parse config.json: " << e.what() << "\n";
      std::cerr << "[config] Using defaults.\n";
    }
  } else {
    // Write default config
    saveConfig(config);
    std::cout << "[config] Created default config at " << config_path.string() << "\n";
  }

  // Resolve notes_dir
  if (config.notes_dir.empty()) {
    config.notes_dir = (fs::path(config.data_dir) / "notes").string();
  }

  return config;
}

void saveConfig(const Config& config) {
  fs::path config_path = fs::path(config.data_dir) / "config.json";
  fs::create_directories(config.data_dir);

  nlohmann::json j = config;
  std::ofstream file(config_path);
  file << j.dump(2) << std::endl;
}

} // namespace cli
