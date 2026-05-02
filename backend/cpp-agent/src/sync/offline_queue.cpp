#include "offline_queue.h"
#include "../cli/logger.h"
#include <nlohmann/json.hpp>
#include <fstream>
#include <filesystem>
#include <algorithm>

namespace fs = std::filesystem;
using json = nlohmann::json;

namespace sync {

static fs::path queueFile(const std::string& queue_dir) {
  return fs::path(queue_dir) / "pending.json";
}

static json noteToQueueJson(const modules::Note& note) {
  return json{
    {"note_id",    note.meta.note_id},
    {"user_id",    note.meta.user_id},
    {"title",      note.meta.title},
    {"content",    note.content},
    {"tags",       note.meta.tags},
    {"source",     note.meta.source},
    {"created_at", note.meta.created_at},
    {"updated_at", note.meta.updated_at},
    {"synced_at",  note.meta.synced_at},
    {"deleted",    note.meta.deleted},
    {"file_path",  note.file_path}
  };
}

static modules::Note queueJsonToNote(const json& j) {
  modules::Note note;
  note.meta.note_id    = j.value("note_id", "");
  note.meta.user_id    = j.value("user_id", "");
  note.meta.title      = j.value("title", "");
  note.meta.source     = j.value("source", "cli");
  note.meta.created_at = j.value("created_at", "");
  note.meta.updated_at = j.value("updated_at", "");
  note.meta.synced_at  = j.value("synced_at", "");
  note.meta.deleted    = j.value("deleted", false);
  note.content         = j.value("content", "");
  note.file_path       = j.value("file_path", "");

  if (j.contains("tags") && j["tags"].is_array()) {
    note.meta.tags = j["tags"].get<std::vector<std::string>>();
  }

  return note;
}

void enqueue(const std::string& queue_dir, const std::vector<modules::Note>& notes) {
  fs::create_directories(queue_dir);
  auto path = queueFile(queue_dir);

  // Read existing queue
  json queue_arr = json::array();
  if (fs::exists(path)) {
    try {
      std::ifstream f(path);
      queue_arr = json::parse(f);
    } catch (...) {
      queue_arr = json::array();
    }
  }

  // Append new notes (deduplicate by note_id)
  for (const auto& note : notes) {
    // Remove existing entry with same note_id
    queue_arr.erase(
      std::remove_if(queue_arr.begin(), queue_arr.end(),
        [&](const json& item) { return item.value("note_id", "") == note.meta.note_id; }),
      queue_arr.end()
    );
    queue_arr.push_back(noteToQueueJson(note));
  }

  std::ofstream f(path);
  f << queue_arr.dump(2) << std::endl;

  cli::logInfo("[queue] Enqueued " + std::to_string(notes.size()) +
               " note(s). Queue size: " + std::to_string(queue_arr.size()));
}

std::vector<modules::Note> readQueue(const std::string& queue_dir) {
  std::vector<modules::Note> notes;
  auto path = queueFile(queue_dir);

  if (!fs::exists(path)) {
    return notes;
  }

  try {
    std::ifstream f(path);
    auto arr = json::parse(f);

    for (const auto& item : arr) {
      notes.push_back(queueJsonToNote(item));
    }

    // Sort by updated_at ascending (oldest first, as per spec)
    std::sort(notes.begin(), notes.end(), [](const modules::Note& a, const modules::Note& b) {
      return a.meta.updated_at < b.meta.updated_at;
    });
  } catch (const std::exception& e) {
    cli::logError("[queue] Failed to read queue: " + std::string(e.what()));
  }

  return notes;
}

void clearQueue(const std::string& queue_dir) {
  auto path = queueFile(queue_dir);
  if (fs::exists(path)) {
    fs::remove(path);
    cli::logInfo("[queue] Queue cleared.");
  }
}

size_t queueSize(const std::string& queue_dir) {
  auto notes = readQueue(queue_dir);
  return notes.size();
}

} // namespace sync
