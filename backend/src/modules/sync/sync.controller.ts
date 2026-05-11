import { type RequestHandler } from "express";
import { syncService } from "./sync.service.js";

/**
 * POST /api/sync/notes
 * C++ agent pushes new/updated notes.
 * Body: { notes: SyncNotePayload[], last_sync: string | null }
 */
const pushNotes: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.userId ?? "";
    const { notes, last_sync } = request.body;

    if (!Array.isArray(notes)) {
      response.status(400).json({ error: "\"notes\" must be an array." });
      return;
    }

    const result = await syncService.pushNotes(userId, notes, last_sync ?? null);

    response.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sync/notes/pull
 * C++ agent pulls notes that changed on the web since last sync.
 * Query: ?since=ISO8601
 */
const pullNotes: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.userId ?? "";
    const since = (request.query.since as string) ?? null;

    const result = await syncService.pullNotes(userId, since);

    response.json(result);
  } catch (error) {
    next(error);
  }
};

const pullConcepts: RequestHandler = async (request, response, next) => {
  try {
    const result = await syncService.pullConcepts(request.userId ?? "", (request.query.since as string) ?? null);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

const pullMemory: RequestHandler = async (request, response, next) => {
  try {
    const result = await syncService.pullMemory(request.userId ?? "", (request.query.since as string) ?? null);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

const pushRecall: RequestHandler = async (request, response, next) => {
  try {
    const reviews = Array.isArray(request.body?.reviews) ? request.body.reviews : [];
    const result = await syncService.pushRecall(request.userId ?? "", reviews);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

const pullMentorMemory: RequestHandler = async (request, response, next) => {
  try {
    const result = await syncService.pullMentorMemory(request.userId ?? "", (request.query.since as string) ?? null);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sync/status
 * Health check for the sync bridge.
 */
const getStatus: RequestHandler = async (request, response, next) => {
  try {
    const userId = request.userId ?? "";
    const status = await syncService.getSyncStatus(userId);

    response.json(status);
  } catch (error) {
    next(error);
  }
};

export const syncController = {
  pushNotes,
  pullNotes,
  pullConcepts,
  pullMemory,
  pushRecall,
  pullMentorMemory,
  getStatus,
};
