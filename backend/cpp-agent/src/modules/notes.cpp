#include "notes.h"
#include "../cli/logger.h"
#include <iostream>
#include <iomanip>
#include <algorithm>
#include <cctype>
#include <chrono>
#include <set>
#include <sstream>

namespace modules {

Note createNote(const cli::Config& config, const std::string& title,
                const std::vector<std::string>& tags, const std::string& content) {
  Note note;
  note.meta.note_id = generateUUID();
  note.meta.user_id = config.user_id;
  note.meta.title = title;
  note.meta.tags = tags;
  note.meta.topic = tags.empty() ? title : tags[0];
  note.meta.source = "cli";
  note.meta.created_at = nowISO8601();
  note.meta.updated_at = note.meta.created_at;
  note.meta.synced_at = "";
  note.meta.next_review_at = note.meta.created_at;
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
    std::cout << "     Strength: " << static_cast<int>(n.meta.strength * 100) << "%";
    if (!n.meta.next_review_at.empty()) {
      std::cout << "  Next review: " << n.meta.next_review_at;
    }
    std::cout << "\n";

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

static std::set<std::string> tokens(const std::string& text) {
  std::string clean;
  clean.reserve(text.size());
  for (char c : text) {
    clean += std::isalnum(static_cast<unsigned char>(c)) ? static_cast<char>(std::tolower(static_cast<unsigned char>(c))) : ' ';
  }

  std::set<std::string> out;
  std::istringstream iss(clean);
  std::string token;
  while (iss >> token) {
    if (token.size() > 3) {
      out.insert(token);
    }
  }
  return out;
}

static double scoreRecall(const Note& note, const std::string& answer) {
  auto source = tokens(note.meta.title + " " + note.meta.topic + " " + note.content);
  auto response = tokens(answer);
  if (source.empty() || response.empty()) return 0.0;

  int matches = 0;
  for (const auto& token : source) {
    if (response.count(token)) {
      ++matches;
    }
  }

  return std::min(1.0, static_cast<double>(matches) / static_cast<double>(std::min<size_t>(source.size(), 12)));
}

static std::string isoInHours(int hours) {
  auto time_point = std::chrono::system_clock::now() + std::chrono::hours(hours);
  auto time = std::chrono::system_clock::to_time_t(time_point);
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

static std::string scheduleNextReview(double strength, const std::string& grade) {
  if (grade == "good") {
    return isoInHours(std::max(72, static_cast<int>((3.0 + strength * 10.0) * 24.0)));
  }

  if (grade == "weak") {
    return isoInHours(24);
  }

  return isoInHours(6);
}

void runRecallSession(const cli::Config& config) {
  auto notes = listNotes(config.notes_dir);
  auto now = nowISO8601();

  std::vector<Note> due;
  for (auto& note : notes) {
    if (note.meta.next_review_at.empty() || note.meta.next_review_at <= now) {
      due.push_back(note);
    }
  }

  if (due.empty()) {
    std::cout << "  No notes are due for recall right now.\n";
    return;
  }

  std::cout << "\n  Recall session: " << due.size() << " due note(s)\n";
  std::cout << "  Type your explanation, then press Enter. Empty answer skips.\n\n";

  for (auto& note : due) {
    auto topic = note.meta.topic.empty() ? note.meta.title : note.meta.topic;
    std::cout << "  Explain " << topic << ":\n  > ";

    std::string answer;
    std::getline(std::cin, answer);
    if (answer.empty()) {
      std::cout << "  Skipped.\n\n";
      continue;
    }

    auto score = scoreRecall(note, answer);
    std::string grade;
    if (score >= 0.55) {
      grade = "good";
      note.meta.strength = std::min(1.0, note.meta.strength + 0.18);
    } else if (score >= 0.22) {
      grade = "weak";
      note.meta.strength = std::min(0.8, note.meta.strength + 0.06);
    } else {
      grade = "wrong";
      note.meta.strength = std::max(0.05, note.meta.strength * 0.45);
      note.meta.lapse_count += 1;
    }

    note.meta.review_count += 1;
    note.meta.last_reviewed = nowISO8601();
    note.meta.updated_at = note.meta.last_reviewed;
    note.meta.synced_at = "";
    note.meta.next_review_at = scheduleNextReview(note.meta.strength, grade);
    writeNote(config.notes_dir, note);

    std::cout << "  Result: " << grade << " (" << static_cast<int>(score * 100) << "% match). ";
    std::cout << "Strength now " << static_cast<int>(note.meta.strength * 100) << "%.";
    std::cout << " Next review: " << note.meta.next_review_at << "\n\n";
  }
}

} // namespace modules
