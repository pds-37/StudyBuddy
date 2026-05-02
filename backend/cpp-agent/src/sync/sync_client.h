#pragma once

#include "../modules/file_ops.h"
#include "../cli/config_loader.h"
#include <string>
#include <vector>

namespace sync {

struct SyncResult {
  std::vector<std::string> accepted;
  std::vector<std::string> rejected;
  std::vector<std::string> conflicts;
  bool success = false;
  std::string error;
};

struct PullResult {
  std::vector<modules::Note> notes;
  bool success = false;
  std::string error;
};

struct SyncStatus {
  std::string last_push;
  std::string last_pull;
  int total_notes = 0;
  std::string user_id;
  bool success = false;
  std::string error;
};

/** Pushes local unsynced notes to the web backend. */
SyncResult pushNotes(const cli::Config& config, const std::vector<modules::Note>& notes);

/** Pulls notes from the web backend that changed since last sync. */
PullResult pullNotes(const cli::Config& config, const std::string& since);

/** Checks sync bridge status/health. */
SyncStatus getStatus(const cli::Config& config);

} // namespace sync
