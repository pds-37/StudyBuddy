#pragma once

#include <string>
#include <vector>

namespace cli {

/** Represents a parsed command with its module, action, and arguments. */
struct Command {
  std::string module;              // e.g., "note", "sync", "chat", "config"
  std::string action;              // e.g., "add", "list", "push", "pull"
  std::vector<std::string> args;   // positional arguments
  std::vector<std::pair<std::string, std::string>> flags; // --key=value pairs
};

/**
 * Parses a raw input string into a Command struct.
 * Supports formats like:
 *   note add "My Title" --tags=cpp,dsa
 *   sync push
 *   chat
 */
Command parse(const std::string& input);

/**
 * Tokenizes a raw input string, handling quoted strings.
 * "note add \"My Title\" --tags=cpp" → ["note", "add", "My Title", "--tags=cpp"]
 */
std::vector<std::string> tokenize(const std::string& input);

} // namespace cli
