#include "command_parser.h"
#include <sstream>

namespace cli {

std::vector<std::string> tokenize(const std::string& input) {
  std::vector<std::string> tokens;
  std::string current;
  bool in_quotes = false;
  char quote_char = '\0';

  for (size_t i = 0; i < input.size(); ++i) {
    char c = input[i];

    if (in_quotes) {
      if (c == quote_char) {
        in_quotes = false;
      } else {
        current += c;
      }
    } else if (c == '"' || c == '\'') {
      in_quotes = true;
      quote_char = c;
    } else if (c == ' ' || c == '\t') {
      if (!current.empty()) {
        tokens.push_back(current);
        current.clear();
      }
    } else {
      current += c;
    }
  }

  if (!current.empty()) {
    tokens.push_back(current);
  }

  return tokens;
}

Command parse(const std::string& input) {
  Command cmd;
  auto tokens = tokenize(input);

  if (tokens.empty()) {
    return cmd;
  }

  cmd.module = tokens[0];

  if (tokens.size() > 1) {
    // Check if second token is a flag — if so, action is empty
    if (tokens[1].substr(0, 2) == "--") {
      cmd.action = "";
    } else {
      cmd.action = tokens[1];
    }
  }

  size_t start = cmd.action.empty() ? 1 : 2;

  for (size_t i = start; i < tokens.size(); ++i) {
    const auto& token = tokens[i];

    if (token.substr(0, 2) == "--") {
      // Flag: --key=value or --key
      auto eq_pos = token.find('=');
      if (eq_pos != std::string::npos) {
        cmd.flags.emplace_back(token.substr(2, eq_pos - 2), token.substr(eq_pos + 1));
      } else {
        cmd.flags.emplace_back(token.substr(2), "true");
      }
    } else {
      cmd.args.push_back(token);
    }
  }

  return cmd;
}

} // namespace cli
