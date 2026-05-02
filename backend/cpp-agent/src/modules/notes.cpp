#include "notes.h"
#include "../cli/logger.h"
#include <iostream>
#include <iomanip>

namespace modules {

Note createNote(const cli::Config& config, const std::string& title,
                const std::vector<std::string>& tags, const std::string& content) {
  Note note;
  note.meta.note_id = generateUUID();
  note.meta.user_id = config.user_id;
  note.meta.title = title;
  note.meta.tags = tags;
  note.meta.source = "cli";
  note.meta.created_at = nowISO8601();
  note.meta.updated_at = note.meta.created_at;
  note.meta.synced_at = "";
  note.meta.deleted = false;
  note.content = content;

  auto path = writeNote(config.notes_dir, note);
  note.file_path = path;

  cli::logInfo("Created note: " + note.meta.note_id + " → " + path);
  return note;
}

void printNotesList(const cli::Config& config) {
  auto notes = listNotes(config.notes_dir);

  if (notes.empty()) {
    std::cout << "  No notes found.\n";
    return;
  }

  std::cout << "\n  " << notes.size() << " note(s):\n\n";

  for (size_t i = 0; i < notes.size(); ++i) {
    const auto& n = notes[i];
    std::cout << "  " << (i + 1) << ". " << n.meta.title << "\n";
    std::cout << "     ID: " << n.meta.note_id.substr(0, 8) << "...  ";
    std::cout << "Tags: ";
    if (n.meta.tags.empty()) {
      std::cout << "(none)";
    } else {
      for (size_t t = 0; t < n.meta.tags.size(); ++t) {
        if (t > 0) std::cout << ", ";
        std::cout << n.meta.tags[t];
      }
    }
    std::cout << "  Updated: " << n.meta.updated_at << "\n";

    // Show sync status
    if (n.meta.synced_at.empty()) {
      std::cout << "     ⬤ Not synced\n";
    } else {
      std::cout << "     ✓ Synced: " << n.meta.synced_at << "\n";
    }
    std::cout << "\n";
  }
}

void printSearchResults(const cli::Config& config, const std::string& query) {
  auto results = searchNotes(config.notes_dir, query);

  if (results.empty()) {
    std::cout << "  No notes matched \"" << query << "\".\n";
    return;
  }

  std::cout << "\n  " << results.size() << " result(s) for \"" << query << "\":\n\n";
  for (size_t i = 0; i < results.size(); ++i) {
    const auto& n = results[i];
    std::cout << "  " << (i + 1) << ". " << n.meta.title << " [" << n.meta.note_id.substr(0, 8) << "...]\n";

    // Show a content preview (first 120 chars)
    std::string preview = n.content.substr(0, 120);
    auto nl = preview.find('\n');
    if (nl != std::string::npos) {
      preview = preview.substr(0, nl);
    }
    std::cout << "     " << preview << "...\n\n";
  }
}

std::optional<Note> findNoteById(const cli::Config& config, const std::string& note_id) {
  auto all = listNotes(config.notes_dir);
  for (auto& note : all) {
    if (note.meta.note_id == note_id || note.meta.note_id.substr(0, note_id.size()) == note_id) {
      return note;
    }
  }
  return std::nullopt;
}

bool softDeleteNote(const cli::Config& config, const std::string& note_id) {
  auto note_opt = findNoteById(config, note_id);
  if (!note_opt) {
    return false;
  }

  auto& note = *note_opt;
  note.meta.deleted = true;
  note.meta.updated_at = nowISO8601();

  // Rewrite the file with deleted flag
  writeNote(config.notes_dir, note);

  // Move to trash
  auto trash_dir = (std::filesystem::path(config.data_dir) / "trash").string();
  deleteNote(note.file_path, trash_dir);

  cli::logInfo("Soft-deleted note: " + note.meta.note_id);
  return true;
}

} // namespace modules
