#pragma once

#include "../cli/config_loader.h"
#include "../modules/file_ops.h"
#include <string>
#include <vector>
#include <functional>

namespace ai {

struct Message {
  std::string role;     // "system", "user", "assistant"
  std::string content;
};

/**
 * Streams a chat completion from the Groq API.
 * Calls on_token for each received token (for real-time terminal output).
 * Returns the full assistant response.
 */
std::string chatCompletion(
  const cli::Config& config,
  const std::vector<Message>& messages,
  const std::function<void(const std::string&)>& on_token = nullptr
);

/** Builds a system prompt that includes context from recent notes. */
std::string buildSystemPrompt(const cli::Config& config, int max_notes = 5);

/** Runs the interactive AI chat loop. */
void chatLoop(const cli::Config& config);

} // namespace ai
