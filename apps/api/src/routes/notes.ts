import { Router } from "express";
import { z } from "zod";

import { createReminderDate } from "../utils/dates";
import { analyseStudyNote, structureStudyNote } from "../services/gemini";
import { requireAuth } from "../middleware/requireAuth";
import { store, type CreateLearningItemInput, type StoredNote } from "../data/store";

const router = Router();

const createNoteSchema = z.object({
  content: z.string().min(8),
  subjectHint: z.string().optional(),
  analyse: z.boolean().default(true)
});

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildMcqOptions(topic: string, note: StoredNote) {
  const correct = note.summary;
  const distractors = [
    `${topic} is mainly a memorization-only topic with no practical use.`,
    `${topic} can be solved only by writing code, not by understanding concepts.`,
    `${topic} is unrelated to ${note.subject} and does not affect exam performance.`
  ];

  return [correct, ...distractors];
}

function buildLearningItems(note: StoredNote): CreateLearningItemInput[] {
  const dueAt = createReminderDate(1);
  const topics = uniqueStrings([note.roadmapTopic, note.category, ...note.keyConcepts]).slice(0, 3);
  const selectedTopics = topics.length ? topics : [note.subject];

  return selectedTopics.flatMap((topic) => [
    {
      userId: note.userId,
      noteId: note.id,
      subject: note.subject,
      topic,
      kind: "flashcard",
      prompt: `Explain ${topic} in your own words.`,
      answer: note.summary,
      options: [],
      correctOption: null,
      reviewStage: 0,
      dueAt
    },
    {
      userId: note.userId,
      noteId: note.id,
      subject: note.subject,
      topic,
      kind: "mcq",
      prompt: `Which statement best matches ${topic}?`,
      answer: note.summary,
      options: buildMcqOptions(topic, note),
      correctOption: 0,
      reviewStage: 0,
      dueAt
    },
    {
      userId: note.userId,
      noteId: note.id,
      subject: note.subject,
      topic,
      kind: "short_answer",
      prompt: `Write a short answer for ${topic}.`,
      answer: note.summary,
      options: [],
      correctOption: null,
      reviewStage: 0,
      dueAt
    }
  ]);
}

router.use(requireAuth);

router.get("/", async (request, response) => {
  const notes = await store.listNotes(request.user!.id);
  response.json({ notes });
});

router.post("/", async (request, response) => {
  const parsed = createNoteSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: "Write a fuller study note before saving it." });
    return;
  }

  let analysis = {
    subject: parsed.data.subjectHint || "General",
    category: "Quick Capture",
    keyConcepts: [] as string[],
    summary: parsed.data.content.slice(0, 120),
    confidence: 0,
    suggestedRoadmapTopic: ""
  };
  let noteContent = parsed.data.content;
  let warning: string | undefined;

  if (parsed.data.analyse) {
    try {
      analysis = await analyseStudyNote(parsed.data.content, parsed.data.subjectHint);
      try {
        noteContent = await structureStudyNote(parsed.data.content, analysis.subject, analysis.category);
      } catch {
        warning = "Saved with AI tagging, but the note kept its raw format.";
      }
    } catch {
      warning = "Saved without AI analysis. Add your Gemini key later to enable smart tagging.";
    }
  }

  const note = await store.createNote({
    userId: request.user!.id,
    content: noteContent,
    subject: analysis.subject,
    category: analysis.category,
    keyConcepts: analysis.keyConcepts,
    summary: analysis.summary,
    confidence: analysis.confidence,
    roadmapTopic: analysis.suggestedRoadmapTopic
  });

  await store.createLearningItems(buildLearningItems(note));

  await store.createReminder({
    userId: request.user!.id,
    title: `Revise ${analysis.category || analysis.subject}`,
    scheduledAt: createReminderDate(1),
    intervalDays: 1,
    isReviewed: false,
    noteId: note.id,
    topic: analysis.category || analysis.subject,
    kind: "revision"
  });

  response.status(201).json({ note, warning });
});

router.delete("/:noteId", async (request, response) => {
  const deleted = await store.deleteNote(request.user!.id, request.params.noteId);
  if (!deleted) {
    response.status(404).json({ message: "Note not found." });
    return;
  }

  response.status(204).send();
});

export default router;
