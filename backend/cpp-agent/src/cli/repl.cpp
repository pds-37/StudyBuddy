#include "repl.h"
#include "command_parser.h"
#include "logger.h"
#include "../modules/notes.h"
#include "../sync/sync_client.h"
#include "../sync/offline_queue.h"
#include "../ai/groq_client.h"
#include <iostream>
#include <filesystem>
#include <sstream>

namespace fs = std::filesystem;

namespace cli {

void printHelp() {
  std::cout << R"(
  ╔═══════════════════════════════════════════════════════╗
  ║            StudyBuddy CLI Agent v0.1.0                ║
  ╚═══════════════════════════════════════════════════════╝

  COMMANDS:

    note add "Title" [--tags=tag1,tag2]     Create a new note
    note list                               List all local notes
    note search "query"                     Search notes by keyword
    note delete <note_id>                   Soft-delete a note
    recall start                            Run offline active recall

    sync push                               Push unsynced notes to web
    sync pull                               Pull notes from web
    sync status                             Check sync bridge health
    sync queue                              Show offline queue size

    chat                                    Start AI chat (Groq)

    config show                             Display current config
    config set <key> <value>                Update a config value

    help                                    Show this help
    exit / quit                             Exit the CLI

)";
}

static std::string getFlag(const Command& cmd, const std::string& key) {
  for (const auto& [k, v] : cmd.flags) {
    if (k == key) return v;
  }
  return "";
}

static std::vector<std::string> splitComma(const std::string& s) {
  std::vector<std::string> result;
  std::istringstream iss(s);
  std::string token;
  while (std::getline(iss, token, ',')) {
    if (!token.empty()) result.push_back(token);
  }
  return result;
}

void executeCommand(Config& config, const std::string& input) {
  auto cmd = parse(input);

  if (cmd.module.empty()) return;

  // ── note commands ────────────────────────────────────────────
  if (cmd.module == "note") {
    if (cmd.action == "add") {
      std::string title = cmd.args.empty() ? "" : cmd.args[0];
      if (title.empty()) {
        std::cout << "  Title: ";
        std::getline(std::cin, title);
      }

      auto tags = splitComma(getFlag(cmd, "tags"));

      std::cout << "  Enter note content (empty line to finish):\n";
      std::string content;
      std::string line;
      while (std::getline(std::cin, line)) {
        if (line.empty()) break;
        content += line + "\n";
      }

      auto note = modules::createNote(config, title, tags, content);
      std::cout << "  ✓ Note created: " << note.meta.note_id.substr(0, 8) << "...\n";
    }
    else if (cmd.action == "list") {
      modules::printNotesList(config);
    }
    else if (cmd.action == "search") {
      std::string query = cmd.args.empty() ? "" : cmd.args[0];
      if (query.empty()) {
        std::cout << "  Search: ";
        std::getline(std::cin, query);
      }
      modules::printSearchResults(config, query);
    }
    else if (cmd.action == "delete") {
      std::string id = cmd.args.empty() ? "" : cmd.args[0];
      if (id.empty()) {
        std::cout << "  Note ID: ";
        std::getline(std::cin, id);
      }
      if (modules::softDeleteNote(config, id)) {
        std::cout << "  ✓ Note deleted.\n";
      } else {
        std::cout << "  ✗ Note not found.\n";
      }
    }
    else {
      std::cout << "  Unknown note command: " << cmd.action << "\n";
      std::cout << "  Try: note add | note list | note search | note delete\n";
    }
  }

  // ── sync commands ────────────────────────────────────────────
  else if (cmd.module == "sync") {
    auto queue_dir = (fs::path(config.data_dir) / "queue").string();

    if (cmd.action == "push") {
      // Collect unsynced notes
      auto all_notes = modules::listNotes(config.notes_dir);
      std::vector<modules::Note> unsynced;
      for (const auto& n : all_notes) {
        if (n.meta.synced_at.empty()) {
          unsynced.push_back(n);
        }
      }

      // Also drain offline queue
      auto queued = sync::readQueue(queue_dir);
      for (auto& q : queued) {
        unsynced.push_back(std::move(q));
      }

      if (unsynced.empty()) {
        std::cout << "  Everything is synced!\n";
        return;
      }

      std::cout << "  Pushing " << unsynced.size() << " note(s)...\n";
      auto result = sync::pushNotes(config, unsynced);

      if (result.success) {
        std::cout << "  ✓ Accepted: " << result.accepted.size() << "\n";
        if (!result.conflicts.empty()) {
          std::cout << "  ⚠ Conflicts: " << result.conflicts.size() << " (server version is newer)\n";
        }
        if (!result.rejected.empty()) {
          std::cout << "  ✗ Rejected: " << result.rejected.size() << "\n";
        }

        // Update synced_at on accepted notes
        for (const auto& accepted_id : result.accepted) {
          auto note = modules::findNoteById(config, accepted_id);
          if (note) {
            note->meta.synced_at = modules::nowISO8601();
            modules::writeNote(config.notes_dir, *note);
          }
        }

        // Clear queue on success
        sync::clearQueue(queue_dir);
      } else {
        std::cout << "  ✗ Push failed: " << result.error << "\n";
        std::cout << "  Notes added to offline queue.\n";
        sync::enqueue(queue_dir, unsynced);
      }
    }
    else if (cmd.action == "pull") {
      std::cout << "  Pulling notes from web...\n";
      auto result = sync::pullNotes(config, "");

      if (result.success) {
        std::cout << "  ✓ Received " << result.notes.size() << " note(s).\n";

        for (auto& note : result.notes) {
          // Check if we already have this note locally
          auto existing = modules::findNoteById(config, note.meta.note_id);
          if (existing) {
            // Update local file if web version is newer
            if (note.meta.updated_at > existing->meta.updated_at) {
              note.file_path = existing->file_path;
              modules::writeNote(config.notes_dir, note);
              std::cout << "  ↻ Updated: " << note.meta.title << "\n";
            }
          } else {
            // New note from web
            modules::writeNote(config.notes_dir, note);
            std::cout << "  + New: " << note.meta.title << "\n";
          }
        }
      } else {
        std::cout << "  ✗ Pull failed: " << result.error << "\n";
      }
    }
    else if (cmd.action == "status") {
      auto status = sync::getStatus(config);
      if (status.success) {
        std::cout << "\n  Sync Status:\n";
        std::cout << "    User:        " << status.user_id << "\n";
        std::cout << "    Last push:   " << (status.last_push.empty() ? "never" : status.last_push) << "\n";
        std::cout << "    Last pull:   " << (status.last_pull.empty() ? "never" : status.last_pull) << "\n";
        std::cout << "    Cloud notes: " << status.total_notes << "\n";
        std::cout << "    Queue:       " << sync::queueSize(queue_dir) << " pending\n\n";
      } else {
        std::cout << "  ✗ " << status.error << "\n";
      }
    }
    else if (cmd.action == "queue") {
      auto size = sync::queueSize(queue_dir);
      std::cout << "  Offline queue: " << size << " note(s) pending.\n";
    }
    else {
      std::cout << "  Unknown sync command. Try: sync push | sync pull | sync status\n";
    }
  }

  else if (cmd.module == "recall") {
    if (cmd.action == "start") {
      modules::runRecallSession(config);
    } else {
      std::cout << "  Try: recall start\n";
    }
  }

  // ── chat command ─────────────────────────────────────────────
  else if (cmd.module == "chat") {
    ai::chatLoop(config);
  }

  // ── config commands ──────────────────────────────────────────
  else if (cmd.module == "config") {
    if (cmd.action == "show") {
      std::cout << "\n  Current Configuration:\n";
      std::cout << "    sync_url:     " << config.sync_url << "\n";
      std::cout << "    user_id:      " << (config.user_id.empty() ? "(not set)" : config.user_id) << "\n";
      std::cout << "    auth_token:   " << (config.auth_token.empty() ? "(not set)" : "***set***") << "\n";
      std::cout << "    groq_api_key: " << (config.groq_api_key.empty() ? "(not set)" : "***set***") << "\n";
      std::cout << "    notes_dir:    " << config.notes_dir << "\n";
      std::cout << "    data_dir:     " << config.data_dir << "\n\n";
    }
    else if (cmd.action == "set") {
      if (cmd.args.size() < 2) {
        std::cout << "  Usage: config set <key> <value>\n";
        std::cout << "  Keys: sync_url, user_id, auth_token, groq_api_key\n";
        return;
      }
      auto key = cmd.args[0];
      auto value = cmd.args[1];

      if (key == "sync_url")      config.sync_url = value;
      else if (key == "user_id")  config.user_id = value;
      else if (key == "auth_token") config.auth_token = value;
      else if (key == "groq_api_key") config.groq_api_key = value;
      else {
        std::cout << "  Unknown config key: " << key << "\n";
        return;
      }

      saveConfig(config);
      std::cout << "  ✓ Config updated: " << key << "\n";
    }
    else {
      std::cout << "  Try: config show | config set <key> <value>\n";
    }
  }

  // ── help ─────────────────────────────────────────────────────
  else if (cmd.module == "help") {
    printHelp();
  }

  // ── exit ─────────────────────────────────────────────────────
  else if (cmd.module == "exit" || cmd.module == "quit") {
    // Handled in REPL loop
  }

  // ── unknown ──────────────────────────────────────────────────
  else {
    std::cout << "  Unknown command: " << cmd.module << "\n";
    std::cout << "  Type 'help' for a list of commands.\n";
  }
}

void startRepl(Config& config) {
  std::cout << R"(
  ╔═══════════════════════════════════════════════════════╗
  ║            StudyBuddy CLI Agent v0.1.0                ║
  ║         Type 'help' for commands.                     ║
  ╚═══════════════════════════════════════════════════════╝

)";

  while (true) {
    std::cout << "  studybuddy > ";
    std::string input;
    std::getline(std::cin, input);

    // Trim whitespace
    while (!input.empty() && (input.front() == ' ' || input.front() == '\t'))
      input.erase(input.begin());
    while (!input.empty() && (input.back() == ' ' || input.back() == '\t'))
      input.pop_back();

    if (input.empty()) continue;
    if (input == "exit" || input == "quit") break;

    executeCommand(config, input);
  }

  std::cout << "  Goodbye!\n";
}

} // namespace cli
