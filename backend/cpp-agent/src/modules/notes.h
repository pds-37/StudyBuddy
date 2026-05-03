#pragma once

#include "file_ops.h"
#include "../cli/config_loader.h"
#include <string>
#include <vector>

namespace modules {

/**
 * High-level notes module that handles CLI commands:
 *   note add "Title" --tags=cpp,dsa
 *   note list
 *   note search "query"
 *   note edit <note_id>
 *   note delete <note_id>
 */

/** Creates a new note interactively or from arguments. */
Note createNote(const cli::Config& config, const std::string& title,
                const std::vector<std::string>& tags, const std::string& content);

/** Lists all local notes (non-deleted). */
void printNotesList(const cli::Config& config);

/** Searches notes and prints results. */
void printSearchResults(const cli::Config& config, const std::string& query);

/** Finds a note by its note_id (UUID). */
std::optional<Note> findNoteById(const cli::Config& config, const std::string& note_id);

/** Soft-deletes a note by note_id. */
bool softDeleteNote(const cli::Config& config, const std::string& note_id);

/** Runs an offline active-recall session for due local notes. */
void runRecallSession(const cli::Config& config);

} // namespace modules
