#pragma once

#include "../cli/config_loader.h"
#include <string>

namespace cli {

/** Starts the interactive REPL loop. */
void startRepl(Config& config);

/** Executes a single command (used by both REPL and one-shot mode). */
void executeCommand(Config& config, const std::string& input);

/** Prints the help/usage banner. */
void printHelp();

} // namespace cli
