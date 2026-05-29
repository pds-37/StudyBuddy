#include "file_ops.h"
#include <fstream>
#include <sstream>
#include <filesystem>
#include <algorithm>
#include <chrono>
#include <random>
#include <iomanip>
#include <yaml-cpp/yaml.h>

namespace fs = std::filesystem;

namespace modules {

std::string nowISO8601() {
  auto now = std::chrono::system_clock::now();
  auto time = std::chrono::system_clock::to_time_t(now);
  std::tm tm_buf{};
#ifdef _WIN32
  gmtime_s(&tm_buf, &time);
#else
  gmtime_r(&time, &tm_buf);
#endif
  std::ostringstream oss;
  oss << std::put_time(&tm_buf, "%Y-%m-%dT%H:%M:%SZ");
  return oss.str();
}

static std::string datePrefix() {
  auto now = std::chrono::system_clock::now();
  auto time = std::chrono::system_clock::to_time_t(now);
  std::tm tm_buf{};
#ifdef _WIN32
  gmtime_s(&tm_buf, &time);
#else
  gmtime_r(&time, &tm_buf);
#endif
  std::ostringstream oss;
  oss << std::put_time(&tm_buf, "%Y-%m-%d");
  return oss.str();
}

std::string generateUUID() {
  static std::random_device rd;
  static std::mt19937 gen(rd());
  static std::uniform_int_distribution<int> dis(0, 15);
  static const char hex_chars[] = "0123456789abcdef";

  std::string uuid(36, '-');
  // 8-4-4-4-12 pattern
  int positions[] = {0,1,2,3,4,5,6,7, 9,10,11,12, 14,15,16,17, 19,20,21,22, 24,25,26,27,28,29,30,31,32,33,34,35};
  for (int pos : positions) {
    uuid[pos] = hex_chars[dis(gen)];
  }
  // Set version (4) and variant bits
  uuid[14] = '4';
  uuid[19] = hex_chars[(dis(gen) & 0x3) | 0x8];

  return uuid;
}

std::string slugify(const std::string& title) {
  std::string slug;
  slug.reserve(title.size());

  for (char c : title) {
    if (std::isalnum(static_cast<unsigned char>(c))) {
      slug += static_cast<char>(std::tolower(static_cast<unsigned char>(c)));
    } else if (c == ' ' || c == '-' || c == '_') {
      if (!slug.empty() && slug.back() != '-') {
        slug += '-';
      }
    }
  }

  // Trim trailing dash
  while (!slug.empty() && slug.back() == '-') {
    slug.pop_back();
  }

  // Limit length
  if (slug.size() > 60) {
    slug = slug.substr(0, 60);
    auto last_dash = slug.rfind('-');
    if (last_dash != std::string::npos && last_dash > 40) {
      slug = slug.substr(0, last_dash);
    }
  }

  return slug.empty() ? "untitled" : slug;
}

static std::string serializeFrontmatter(const NoteFrontmatter& meta) {
  YAML::Emitter out;
  out << YAML::BeginMap;
  out << YAML::Key << "note_id"    << YAML::Value << meta.note_id;
  out << YAML::Key << "user_id"    << YAML::Value << meta.user_id;
  out << YAML::Key << "title"      << YAML::Value << meta.title;
  out << YAML::Key << "tags"       << YAML::Value << YAML::Flow << meta.tags;
  out << YAML::Key << "source"     << YAML::Value << meta.source;
  out << YAML::Key << "created_at" << YAML::Value << meta.created_at;
  out << YAML::Key << "updated_at" << YAML::Value << meta.updated_at;
  out << YAML::Key << "synced_at"  << YAML::Value << meta.synced_at;
  out << YAML::Key << "topic"      << YAML::Value << meta.topic;
  out << YAML::Key << "strength"   << YAML::Value << meta.strength;
  out << YAML::Key << "next_review_at" << YAML::Value << meta.next_review_at;
  out << YAML::Key << "last_reviewed"  << YAML::Value << meta.last_reviewed;
  out << YAML::Key << "review_count"   << YAML::Value << meta.review_count;
  out << YAML::Key << "lapse_count"    << YAML::Value << meta.lapse_count;
  out << YAML::Key << "deleted"    << YAML::Value << meta.deleted;
  out << YAML::EndMap;

  return std::string(out.c_str());
}

static NoteFrontmatter parseFrontmatter(const YAML::Node& node) {
  NoteFrontmatter meta;
  if (node["note_id"])    meta.note_id    = node["note_id"].as<std::string>("");
  if (node["user_id"])    meta.user_id    = node["user_id"].as<std::string>("");
  if (node["title"])      meta.title      = node["title"].as<std::string>("");
  if (node["tags"])       meta.tags       = node["tags"].as<std::vector<std::string>>(std::vector<std::string>{});
  if (node["source"])     meta.source     = node["source"].as<std::string>("cli");
  if (node["created_at"]) meta.created_at = node["created_at"].as<std::string>("");
  if (node["updated_at"]) meta.updated_at = node["updated_at"].as<std::string>("");
  if (node["synced_at"])  meta.synced_at  = node["synced_at"].as<std::string>("");
  if (node["topic"])      meta.topic      = node["topic"].as<std::string>("");
  if (node["strength"])   meta.strength   = node["strength"].as<double>(0.25);
  if (node["next_review_at"]) meta.next_review_at = node["next_review_at"].as<std::string>("");
  if (node["last_reviewed"])  meta.last_reviewed  = node["last_reviewed"].as<std::string>("");
  if (node["review_count"])   meta.review_count   = node["review_count"].as<int>(0);
  if (node["lapse_count"])    meta.lapse_count    = node["lapse_count"].as<int>(0);
  if (node["deleted"])    meta.deleted    = node["deleted"].as<bool>(false);
  return meta;
}

std::string writeNote(const std::string& notes_dir, const Note& note) {
  fs::create_directories(notes_dir);

  std::string filename;
  if (!note.file_path.empty()) {
    filename = note.file_path;
  } else {
    filename = (fs::path(notes_dir) / (datePrefix() + "-" + slugify(note.meta.title) + ".md")).string();
  }

  std::ofstream file(filename);
  if (!file.is_open()) {
    throw std::runtime_error("Cannot write note to: " + filename);
  }

  file << "---\n" << serializeFrontmatter(note.meta) << "\n---\n\n" << note.content << "\n";
  file.close();

  return filename;
}

std::optional<Note> readNote(const std::string& file_path) {
  std::ifstream file(file_path);
  if (!file.is_open()) {
    return std::nullopt;
  }

  std::string content((std::istreambuf_iterator<char>(file)),
                       std::istreambuf_iterator<char>());
  file.close();

  // Check for YAML frontmatter delimiters
  if (content.substr(0, 4) != "---\n") {
    return std::nullopt;
  }

  auto end_pos = content.find("\n---\n", 4);
  if (end_pos == std::string::npos) {
    return std::nullopt;
  }

  std::string yaml_str = content.substr(4, end_pos - 4);
  std::string body = content.substr(end_pos + 5);

  // Trim leading newlines from body
  while (!body.empty() && body.front() == '\n') {
    body.erase(body.begin());
  }

  try {
    YAML::Node node = YAML::Load(yaml_str);
    Note note;
    note.meta = parseFrontmatter(node);
    note.content = body;
    note.file_path = file_path;
    return note;
  } catch (...) {
    return std::nullopt;
  }
}

std::vector<Note> listNotes(const std::string& notes_dir) {
  std::vector<Note> notes;

  if (!fs::exists(notes_dir)) {
    return notes;
  }

  for (const auto& entry : fs::directory_iterator(notes_dir)) {
    if (entry.is_regular_file() && entry.path().extension() == ".md") {
      auto note = readNote(entry.path().string());
      if (note && !note->meta.deleted) {
        notes.push_back(std::move(*note));
      }
    }
  }

  // Sort by updated_at descending
  std::sort(notes.begin(), notes.end(), [](const Note& a, const Note& b) {
    return a.meta.updated_at > b.meta.updated_at;
  });

  return notes;
}

bool deleteNote(const std::string& file_path, const std::string& trash_dir) {
  if (!fs::exists(file_path)) {
    return false;
  }

  fs::create_directories(trash_dir);
  auto trash_path = fs::path(trash_dir) / fs::path(file_path).filename();
  fs::rename(file_path, trash_path);
  return true;
}

std::vector<Note> searchNotes(const std::string& notes_dir, const std::string& query) {
  auto all_notes = listNotes(notes_dir);
  std::vector<Note> results;

  std::string lower_query = query;
  std::transform(lower_query.begin(), lower_query.end(), lower_query.begin(),
                 [](unsigned char c) { return std::tolower(c); });

  for (auto& note : all_notes) {
    std::string lower_title = note.meta.title;
    std::transform(lower_title.begin(), lower_title.end(), lower_title.begin(),
                   [](unsigned char c) { return std::tolower(c); });

    std::string lower_content = note.content;
    std::transform(lower_content.begin(), lower_content.end(), lower_content.begin(),
                   [](unsigned char c) { return std::tolower(c); });

    if (lower_title.find(lower_query) != std::string::npos ||
        lower_content.find(lower_query) != std::string::npos) {
      results.push_back(std::move(note));
    }
  }

  return results;
}

std::vector<std::string> extractWikilinks(const std::string& content) {
  std::vector<std::string> links;
  size_t pos = 0;
  while (true) {
    size_t start = content.find("[[", pos);
    if (start == std::string::npos) break;
    size_t end = content.find("]]", start + 2);
    if (end == std::string::npos) break;
    
    std::string link = content.substr(start + 2, end - (start + 2));
    
    // Trim spaces from link
    size_t first = link.find_first_not_of(" \t\n\r");
    size_t last = link.find_last_not_of(" \t\n\r");
    if (first != std::string::npos && last != std::string::npos) {
      link = link.substr(first, (last - first + 1));
    } else {
      link.clear();
    }
    
    if (!link.empty() && std::find(links.begin(), links.end(), link) == links.end()) {
      links.push_back(link);
    }
    pos = end + 2;
  }
  return links;
}

} // namespace modules
