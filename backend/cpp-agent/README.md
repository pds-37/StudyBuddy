# StudyBuddy CLI Agent (C++)

Offline-first command-line study companion that syncs with the StudyBuddy web platform.

## Features

- **Local Notes** — Create, list, search, and manage markdown notes with YAML frontmatter
- **Sync Bridge** — Push/pull notes to/from the web backend with last-write-wins conflict resolution
- **Offline Queue** — Automatically queues sync operations when offline; drains on next connection
- **AI Chat** — Direct Groq API integration for AI-powered study assistance (injects note context)
- **REPL** — Interactive command-line interface with one-shot mode support

## Prerequisites

- CMake 3.20+
- C++20 compatible compiler (MSVC 2022, GCC 12+, or Clang 15+)
- Internet connection for first build (downloads dependencies via FetchContent)

## Build

```bash
cd cpp-agent
cmake -B build -S .
cmake --build build --config Release
```

The binary will be at `build/Release/studybuddy.exe` (Windows) or `build/studybuddy` (Linux/Mac).

## Setup

On first run, the agent creates `~/.studybuddy/` with a default `config.json`:

```bash
./studybuddy
```

Configure your settings:

```
studybuddy > config set sync_url http://localhost:5000
studybuddy > config set auth_token YOUR_JWT_TOKEN
studybuddy > config set user_id YOUR_USER_ID
studybuddy > config set groq_api_key YOUR_GROQ_KEY
```

## Commands

| Command | Description |
|---------|-------------|
| `note add "Title" --tags=cpp,dsa` | Create a new note |
| `note list` | List all local notes |
| `note search "query"` | Search notes by keyword |
| `note delete <note_id>` | Soft-delete a note |
| `sync push` | Push unsynced notes to web |
| `sync pull` | Pull notes from web |
| `sync status` | Check sync bridge health |
| `sync queue` | Show offline queue size |
| `chat` | Start AI chat (Groq) |
| `config show` | Display current config |
| `config set <key> <value>` | Update a config value |
| `help` | Show help |
| `exit` | Exit CLI |

## One-Shot Mode

Run commands directly without entering the REPL:

```bash
./studybuddy note list
./studybuddy sync push
./studybuddy note add "My Note" --tags=cpp
```

## Directory Structure

```
~/.studybuddy/
├── config.json        # Configuration
├── notes/             # Local markdown notes
├── logs/              # Agent logs
├── cache/             # Cached data from web
├── queue/             # Offline sync queue
├── trash/             # Soft-deleted notes
└── prompts/           # Custom AI system prompts
    └── system.txt     # (optional) Override default system prompt
```

## Note File Format

Notes are stored as markdown with YAML frontmatter:

```markdown
---
note_id: "550e8400-e29b-41d4-a716-446655440000"
user_id: "user123"
title: "Binary Search Implementation"
tags: [cpp, algorithms, dsa]
source: cli
created_at: "2026-04-28T12:00:00Z"
updated_at: "2026-04-28T12:00:00Z"
synced_at: ""
deleted: false
---

# Binary Search

A binary search algorithm implementation...
```

## Sync Protocol

- **Push**: Sends unsynced notes to `POST /api/sync/notes`
- **Pull**: Fetches updated notes from `GET /api/sync/notes/pull?since=ISO8601`
- **Conflict Resolution**: Last-write-wins based on `updated_at` timestamp
- **Offline**: Failed pushes are queued to `~/.studybuddy/queue/pending.json` and retried automatically
