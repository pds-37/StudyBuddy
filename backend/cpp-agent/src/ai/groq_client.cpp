#include "groq_client.h"
#include "../cli/logger.h"
#include <httplib.h>
#include <nlohmann/json.hpp>
#include <iostream>
#include <sstream>
#include <fstream>
#include <filesystem>
#include <algorithm>
#include <cctype>
#include <set>

using json = nlohmann::json;
namespace fs = std::filesystem;

namespace ai {

/**
 * Routes AI chat through the StudyBuddy web backend's copilot endpoint.
 * This avoids the need for OpenSSL on the C++ side — the backend handles
 * the Groq/Gemini API calls and we just communicate over HTTP.
 */
static std::pair<std::string, int> parseUrl(const std::string& url) {
  std::string host = url;
  int port = 80;

  auto proto_end = host.find("://");
  if (proto_end != std::string::npos) {
    host = host.substr(proto_end + 3);
  }

  auto colon = host.find(':');
  if (colon != std::string::npos) {
    port = std::stoi(host.substr(colon + 1));
    host = host.substr(0, colon);
  }

  return { host, port };
}

static std::set<std::string> tokens(const std::string& text) {
  std::string clean;
  clean.reserve(text.size());
  for (char c : text) {
    clean += std::isalnum(static_cast<unsigned char>(c))
      ? static_cast<char>(std::tolower(static_cast<unsigned char>(c)))
      : ' ';
  }

  std::set<std::string> out;
  std::istringstream iss(clean);
  std::string token;
  while (iss >> token) {
    if (token.size() > 2) out.insert(token);
  }
  return out;
}

static std::string latestUserMessage(const std::vector<Message>& messages) {
  for (auto it = messages.rbegin(); it != messages.rend(); ++it) {
    if (it->role == "user") return it->content;
  }
  return "";
}

static std::string localMemoryAnswer(const cli::Config& config, const std::string& question) {
  auto notes = modules::listNotes(config.notes_dir);
  if (notes.empty()) {
    return "Offline mode: I could not find local notes yet. Capture learning first with: learn add \"...\"";
  }

  auto queryTokens = tokens(question);
  std::vector<std::pair<int, modules::Note>> ranked;

  for (const auto& note : notes) {
    auto noteTokens = tokens(note.meta.title + " " + note.meta.topic + " " + note.content);
    int score = 0;
    for (const auto& token : queryTokens) {
      if (noteTokens.count(token)) ++score;
    }
    if (score > 0) ranked.push_back({score, note});
  }

  std::sort(ranked.begin(), ranked.end(), [](const auto& left, const auto& right) {
    return left.first > right.first;
  });

  if (ranked.empty()) {
    return "Offline mode: I searched your local notes first, but did not find a strong match. Try note search \"keyword\" or add a note for this topic.";
  }

  const auto& note = ranked.front().second;
  std::string snippet = note.content.substr(0, 700);
  if (note.content.size() > 700) snippet += "...";

  std::ostringstream out;
  out << "Offline mode: based on your local note \"" << note.meta.title << "\".\n\n";
  out << snippet << "\n\n";
  out << "Recall prompt: explain " << (note.meta.topic.empty() ? note.meta.title : note.meta.topic)
      << " in your own words before rereading more.";
  return out.str();
}

std::string chatCompletion(
  const cli::Config& config,
  const std::vector<Message>& messages,
  const std::function<void(const std::string&)>& on_token
) {
  std::string user_message = latestUserMessage(messages);

  if (config.auth_token.empty()) {
    cli::logError("[ai] Auth token not set. Falling back to local memory.");
    auto local = localMemoryAnswer(config, user_message);
    if (on_token) on_token(local);
    return local;
  }
  if (config.auth_token.empty()) {
    cli::logError("[ai] Auth token not set. Run: config set auth_token YOUR_TOKEN");
    return "[Error: Not authenticated — set auth_token in config]";
  }

  auto [host, port] = parseUrl(config.sync_url);

  httplib::Client client(host, port);
  client.set_connection_timeout(10);
  client.set_read_timeout(60);

  // Use the backend's copilot endpoint
  // Send the latest user message — the backend handles AI routing
  user_message.clear();
  for (auto it = messages.rbegin(); it != messages.rend(); ++it) {
    if (it->role == "user") {
      user_message = it->content;
      break;
    }
  }

  json body;
  body["message"] = user_message;

  // Include conversation context (last few messages)
  json context = json::array();
  for (const auto& m : messages) {
    if (m.role != "system") {
      context.push_back(json{{"role", m.role}, {"content", m.content}});
    }
  }
  body["conversationHistory"] = context;

  auto headers = httplib::Headers{
    {"Authorization", "Bearer " + config.auth_token},
    {"Content-Type", "application/json"}
  };

  auto res = client.Post("/api/copilot/chat", headers, body.dump(), "application/json");

  if (!res) {
    cli::logError("[ai] Failed to connect to StudyBuddy backend. Falling back to local memory.");
    auto local = localMemoryAnswer(config, user_message);
    if (on_token) on_token(local);
    return local;
    cli::logError("[ai] Failed to connect to StudyBuddy backend at " + config.sync_url);
    return "[Error: Cannot reach backend. Make sure the server is running.]";
  }

  if (res->status == 401) {
    cli::logError("[ai] Authentication failed (401). Falling back to local memory.");
    auto local = localMemoryAnswer(config, user_message);
    if (on_token) on_token(local);
    return local;
    cli::logError("[ai] Authentication failed (401). Update your auth_token.");
    return "[Error: Authentication failed — run: config set auth_token YOUR_TOKEN]";
  }

  if (res->status != 200) {
    cli::logError("[ai] Backend returned HTTP " + std::to_string(res->status) + ". Falling back to local memory.");
    auto local = localMemoryAnswer(config, user_message);
    if (on_token) on_token(local);
    return local;
    cli::logError("[ai] Backend returned HTTP " + std::to_string(res->status));
    return "[Error: Backend returned " + std::to_string(res->status) + "]";
  }

  try {
    auto resp = json::parse(res->body);
    std::string content;

    // Handle different response shapes from the copilot endpoint
    if (resp.contains("response")) {
      content = resp["response"].template get<std::string>();
    } else if (resp.contains("message")) {
      content = resp["message"].template get<std::string>();
    } else if (resp.contains("reply")) {
      content = resp["reply"].template get<std::string>();
    } else {
      content = res->body;
    }

    if (on_token) {
      on_token(content);
    }

    return content;
  } catch (const std::exception& e) {
    cli::logError("[ai] Failed to parse response: " + std::string(e.what()));
    return "[Error: Failed to parse AI response]";
  }
}

std::string buildSystemPrompt(const cli::Config& config, int max_notes) {
  // Check for custom system prompt file
  auto prompt_file = fs::path(config.data_dir) / "prompts" / "system.txt";
  std::string base_prompt;

  if (fs::exists(prompt_file)) {
    std::ifstream f(prompt_file);
    base_prompt = std::string((std::istreambuf_iterator<char>(f)),
                               std::istreambuf_iterator<char>());
  } else {
    base_prompt =
      "You are StudyBuddy, an AI study companion and career copilot. "
      "You help users learn programming, prepare for interviews, "
      "organize their study notes, and plan their career growth. "
      "Be concise, practical, and encouraging. "
      "When the user asks about topics they've noted, reference their notes for context.";
  }

  // Inject recent notes as context
  auto notes = modules::listNotes(config.notes_dir);

  if (!notes.empty()) {
    base_prompt += "\n\n--- USER'S RECENT NOTES (for context) ---\n";

    int count = 0;
    for (const auto& note : notes) {
      if (count >= max_notes) break;

      base_prompt += "\n### " + note.meta.title + "\n";
      // Truncate content to 500 chars per note
      std::string snippet = note.content.substr(0, 500);
      if (note.content.size() > 500) snippet += "...";
      base_prompt += snippet + "\n";
      count++;
    }

    base_prompt += "\n--- END NOTES ---\n";
  }

  return base_prompt;
}

void chatLoop(const cli::Config& config) {
  std::cout << "\n  ╭─────────────────────────────────────╮\n";
  std::cout << "  │  StudyBuddy AI Chat                 │\n";
  std::cout << "  │  Type your message. 'exit' to quit. │\n";
  std::cout << "  ╰─────────────────────────────────────╯\n\n";

  std::vector<Message> history;
  history.push_back({"system", buildSystemPrompt(config)});

  while (true) {
    std::cout << "  You > ";
    std::string input;
    std::getline(std::cin, input);

    if (input.empty()) continue;
    if (input == "exit" || input == "quit" || input == "/exit") break;

    history.push_back({"user", input});

    std::cout << "\n  AI  > ";
    auto response = chatCompletion(config, history, [](const std::string& token) {
      std::cout << token;
    });
    std::cout << "\n\n";

    history.push_back({"assistant", response});

    // Keep history manageable (last 20 messages + system prompt)
    if (history.size() > 21) {
      history.erase(history.begin() + 1, history.begin() + 3);
    }
  }

  std::cout << "  Chat ended.\n";
}

} // namespace ai
