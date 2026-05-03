#include "sync_client.h"
#include "../cli/logger.h"
#include <httplib.h>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

namespace sync {

/** Parses host and port from a URL like http://localhost:5000 */
static std::pair<std::string, int> parseUrl(const std::string& url) {
  std::string host = url;
  int port = 80;

  // Remove protocol
  auto proto_end = host.find("://");
  if (proto_end != std::string::npos) {
    host = host.substr(proto_end + 3);
  }

  // Extract port
  auto colon = host.find(':');
  if (colon != std::string::npos) {
    port = std::stoi(host.substr(colon + 1));
    host = host.substr(0, colon);
  }

  return { host, port };
}

static json noteToJson(const modules::Note& note) {
  return json{
    {"note_id",    note.meta.note_id},
    {"user_id",    note.meta.user_id},
    {"title",      note.meta.title},
    {"content",    note.content},
    {"topic",      note.meta.topic},
    {"tags",       note.meta.tags},
    {"source",     note.meta.source},
    {"created_at", note.meta.created_at},
    {"updated_at", note.meta.updated_at},
    {"synced_at",  note.meta.synced_at.empty() ? json(nullptr) : json(note.meta.synced_at)},
    {"strength",   note.meta.strength},
    {"next_review_at", note.meta.next_review_at.empty() ? json(nullptr) : json(note.meta.next_review_at)},
    {"last_reviewed", note.meta.last_reviewed.empty() ? json(nullptr) : json(note.meta.last_reviewed)},
    {"review_count", note.meta.review_count},
    {"lapse_count", note.meta.lapse_count},
    {"deleted",    note.meta.deleted}
  };
}

static std::string jsonStringOrEmpty(const json& value, const std::string& key) {
  if (!value.contains(key) || value[key].is_null()) {
    return "";
  }
  return value[key].get<std::string>();
}

SyncResult pushNotes(const cli::Config& config, const std::vector<modules::Note>& notes) {
  SyncResult result;
  auto [host, port] = parseUrl(config.sync_url);

  httplib::Client client(host, port);
  client.set_connection_timeout(10);
  client.set_read_timeout(30);

  // Build payload
  json payload;
  json notes_arr = json::array();
  for (const auto& note : notes) {
    notes_arr.push_back(noteToJson(note));
  }
  payload["notes"] = notes_arr;
  payload["last_sync"] = nullptr;

  auto headers = httplib::Headers{
    {"Authorization", "Bearer " + config.auth_token},
    {"Content-Type", "application/json"}
  };

  auto res = client.Post("/api/sync/notes", headers, payload.dump(), "application/json");

  if (!res) {
    result.error = "Connection failed — server unreachable.";
    cli::logError("[sync:push] " + result.error);
    return result;
  }

  if (res->status == 401) {
    result.error = "Authentication failed (401). Run: studybuddy auth login";
    cli::logError("[sync:push] " + result.error);
    return result;
  }

  if (res->status != 200) {
    result.error = "Server returned HTTP " + std::to_string(res->status);
    cli::logError("[sync:push] " + result.error);
    return result;
  }

  try {
    auto body = json::parse(res->body);
    result.success = true;

    if (body.contains("accepted")) {
      result.accepted = body["accepted"].get<std::vector<std::string>>();
    }
    // Simplified: just log rejected/conflicts count
    if (body.contains("rejected")) {
      for (auto& r : body["rejected"]) {
        result.rejected.push_back(r["note_id"].get<std::string>());
      }
    }
    if (body.contains("conflicts")) {
      for (auto& c : body["conflicts"]) {
        result.conflicts.push_back(c["note_id"].get<std::string>());
      }
    }
  } catch (const std::exception& e) {
    result.error = std::string("Failed to parse response: ") + e.what();
    cli::logError("[sync:push] " + result.error);
  }

  return result;
}

PullResult pullNotes(const cli::Config& config, const std::string& since) {
  PullResult result;
  auto [host, port] = parseUrl(config.sync_url);

  httplib::Client client(host, port);
  client.set_connection_timeout(10);
  client.set_read_timeout(30);

  std::string path = "/api/sync/notes/pull";
  if (!since.empty()) {
    path += "?since=" + since;
  }

  auto headers = httplib::Headers{
    {"Authorization", "Bearer " + config.auth_token}
  };

  auto res = client.Get(path, headers);

  if (!res) {
    result.error = "Connection failed — server unreachable.";
    cli::logError("[sync:pull] " + result.error);
    return result;
  }

  if (res->status == 401) {
    result.error = "Authentication failed (401). Run: studybuddy auth login";
    cli::logError("[sync:pull] " + result.error);
    return result;
  }

  if (res->status != 200) {
    result.error = "Server returned HTTP " + std::to_string(res->status);
    cli::logError("[sync:pull] " + result.error);
    return result;
  }

  try {
    auto body = json::parse(res->body);
    result.success = true;

    if (body.contains("notes")) {
      for (auto& n : body["notes"]) {
        modules::Note note;
        note.meta.note_id    = n.value("note_id", "");
        note.meta.user_id    = n.value("user_id", "");
        note.meta.title      = n.value("title", "");
        note.meta.topic      = n.value("topic", "");
        note.meta.source     = n.value("source", "web");
        note.meta.created_at = n.value("created_at", "");
        note.meta.updated_at = n.value("updated_at", "");
        note.meta.synced_at  = jsonStringOrEmpty(n, "synced_at");
        note.meta.strength   = n.value("strength", 0.25);
        note.meta.next_review_at = jsonStringOrEmpty(n, "next_review_at");
        note.meta.last_reviewed  = jsonStringOrEmpty(n, "last_reviewed");
        note.meta.review_count   = n.value("review_count", 0);
        note.meta.lapse_count    = n.value("lapse_count", 0);
        note.meta.deleted    = n.value("deleted", false);

        if (n.contains("tags") && n["tags"].is_array()) {
          note.meta.tags = n["tags"].get<std::vector<std::string>>();
        }

        note.content = n.value("content", "");
        result.notes.push_back(std::move(note));
      }
    }
  } catch (const std::exception& e) {
    result.error = std::string("Failed to parse response: ") + e.what();
    cli::logError("[sync:pull] " + result.error);
  }

  return result;
}

SyncStatus getStatus(const cli::Config& config) {
  SyncStatus status;
  auto [host, port] = parseUrl(config.sync_url);

  httplib::Client client(host, port);
  client.set_connection_timeout(5);

  auto headers = httplib::Headers{
    {"Authorization", "Bearer " + config.auth_token}
  };

  auto res = client.Get("/api/sync/status", headers);

  if (!res) {
    status.error = "Connection failed — server unreachable.";
    return status;
  }

  if (res->status != 200) {
    status.error = "Server returned HTTP " + std::to_string(res->status);
    return status;
  }

  try {
    auto body = json::parse(res->body);
    status.success = true;
    status.last_push   = body.value("last_push", "");
    status.last_pull   = body.value("last_pull", "");
    status.total_notes = body.value("total_notes", 0);
    status.user_id     = body.value("user_id", "");
  } catch (...) {
    status.error = "Failed to parse status response.";
  }

  return status;
}

} // namespace sync
