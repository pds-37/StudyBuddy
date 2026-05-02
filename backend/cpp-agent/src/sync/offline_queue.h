#pragma once

#include "../modules/file_ops.h"
#include <string>
#include <vector>

namespace sync {

/**
 * Offline queue: serializes failed sync operations to disk.
 * When push fails (no network), notes are written to ~/.studybuddy/queue/pending.json
 * On next successful connection, the queue is drained in updated_at ascending order.
 */

/** Adds notes to the offline queue. */
void enqueue(const std::string& queue_dir, const std::vector<modules::Note>& notes);

/** Reads all queued notes, sorted by updated_at ascending. */
std::vector<modules::Note> readQueue(const std::string& queue_dir);

/** Clears the offline queue after successful sync. */
void clearQueue(const std::string& queue_dir);

/** Returns the number of notes currently in the queue. */
size_t queueSize(const std::string& queue_dir);

} // namespace sync
