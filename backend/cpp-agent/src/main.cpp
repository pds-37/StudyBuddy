#include "cli/config_loader.h"
#include "cli/logger.h"
#include "cli/repl.h"
#include <iostream>
#include <string>

int main(int argc, char* argv[]) {
  // Load configuration
  auto config = cli::loadConfig();
  cli::initLogger(config.data_dir);

  cli::logInfo("StudyBuddy Agent started.");

  if (argc > 1) {
    // One-shot mode: execute command from CLI arguments
    std::string command;
    for (int i = 1; i < argc; ++i) {
      if (i > 1) command += " ";
      std::string arg(argv[i]);
      // Re-quote arguments that contain spaces
      if (arg.find(' ') != std::string::npos) {
        command += "\"" + arg + "\"";
      } else {
        command += arg;
      }
    }
    cli::executeCommand(config, command);
  } else {
    // Interactive REPL mode
    cli::startRepl(config);
  }

  return 0;
}
