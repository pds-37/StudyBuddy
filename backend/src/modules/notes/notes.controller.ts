import { type RequestHandler } from "express";
import { notesService } from "./notes.service.js";
import { createNoteSchema, updateNoteSchema, noteIdParamSchema, notesQuerySchema } from "./notes.validation.js";

/** Creates a new note for the authenticated user. */
const create: RequestHandler = async (request, response, next) => {
  try {
    const body = createNoteSchema.parse(request.body);
    const note = await notesService.createNote(request.userId ?? "", body);
    response.status(201).json({ note });
  } catch (error) {
    next(error);
  }
};

/** Retrieves a single note by ID. */
const get: RequestHandler = async (request, response, next) => {
  try {
    const params = noteIdParamSchema.parse(request.params);
    const note = await notesService.getNote(request.userId ?? "", params.id);
    response.json({ note });
  } catch (error) {
    next(error);
  }
};

/** Updates an existing note. */
const update: RequestHandler = async (request, response, next) => {
  try {
    const params = noteIdParamSchema.parse(request.params);
    const body = updateNoteSchema.parse(request.body);
    const note = await notesService.updateNote(request.userId ?? "", params.id, body);
    response.json({ note });
  } catch (error) {
    next(error);
  }
};

/** Deletes a note. */
const remove: RequestHandler = async (request, response, next) => {
  try {
    const params = noteIdParamSchema.parse(request.params);
    await notesService.deleteNote(request.userId ?? "", params.id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

/** Lists notes for the authenticated user. */
const list: RequestHandler = async (request, response, next) => {
  try {
    const query = notesQuerySchema.parse(request.query);
    const result = await notesService.listNotes(request.userId ?? "", query);
    response.json(result);
  } catch (error) {
    next(error);
  }
};

/** Searches notes using semantic vector search. */
const search: RequestHandler = async (request, response, next) => {
  try {
    const { q: query, limit = 5, minSimilarity = 0.1 } = request.query as {
      q?: string;
      limit?: string;
      minSimilarity?: string;
    };

    if (!query) {
      return response.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const results = await notesService.searchNotes(
      request.userId ?? "",
      query,
      parseInt(limit as string) || 5,
      parseFloat(minSimilarity as string) || 0.1
    );

    response.json({ results });
  } catch (error) {
    next(error);
  }
};

/** Updates embeddings for all user notes. */
const updateEmbeddings: RequestHandler = async (request, response, next) => {
  try {
    const updatedCount = await notesService.updateAllNoteEmbeddings(request.userId ?? "");
    response.json({ message: `Updated embeddings for ${updatedCount} notes` });
  } catch (error) {
    next(error);
  }
};

export const notesController = {
  create,
  get,
  update,
  remove,
  list,
  search,
  updateEmbeddings
};
