#pragma once

#include <string>
#include <vector>
#include <optional>

namespace modules {

/** Represents the YAML frontmatter of a local note file. */
struct NoteFrontmatter {
  std::string note_id;
  std::string user_id;
  std::string title;
  std::vector<std::string> tags;
  std::string source;          // "cli" or "web"
  std::string created_at;
  std::string updated_at;
  std::string synced_at;       // empty string = not synced
  std::string topic;
  double strength = 0.25;
  std::string next_review_at;
  std::string last_reviewed;
  int review_count = 0;
  int lapse_count = 0;
  bool deleted = false;
};

/** Represents a full note: frontmatter + markdown body. */
struct Note {
  NoteFrontmatter meta;
  std::string content;         // The markdown body (everything after frontmatter)
  std::string file_path;       // Absolute path to the .md file
};

/**
 * Writes a note to disk as a markdown file with YAML frontmatter.
 * File path: {notes_dir}/YYYY-MM-DD-{slug}.md
 */
std::string writeNote(const std::string& notes_dir, const Note& note);

/** Reads a single note from a markdown file. */
std::optional<Note> readNote(const std::string& file_path);

/** Lists all notes in the notes directory. */
std::vector<Note> listNotes(const std::string& notes_dir);

/** Deletes a note file (moves to trash_dir). */
bool deleteNote(const std::string& file_path, const std::string& trash_dir);

/** Searches notes by substring match in title or content. */
std::vector<Note> searchNotes(const std::string& notes_dir, const std::string& query);

/** Generates a URL-safe slug from a title. */
std::string slugify(const std::string& title);

/** Returns current ISO8601 timestamp. */
std::string nowISO8601();

/** Generates a UUID v4 string. */
std::string generateUUID();

/** Extracts all wikilinks [[Concept]] from content. */
std::vector<std::string> extractWikilinks(const std::string& content);

} // namespace modules
