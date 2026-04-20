import { z } from "zod";
import { noteSchema } from "@studybuddy/shared";

export const createNoteSchema = noteSchema;

export const updateNoteSchema = noteSchema.partial();

export const noteIdParamSchema = z.object({
  id: z.string().min(1)
});

export const notesQuerySchema = z.object({
  tags: z.string().optional(),
  linkedSkills: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0)
});
