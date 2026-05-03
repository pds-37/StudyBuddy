import { useState, useEffect } from "react";
import { listNotes, deleteNote } from "../../../lib/api/notes";
import type { CareerNote } from "@studybuddy/shared";

type NotesListProps = {
  refreshTrigger?: number;
  onEdit?: (note: CareerNote) => void;
};

/** Displays a list of user notes with edit/delete actions. */
export function NotesList({ refreshTrigger, onEdit }: NotesListProps) {
  const [notes, setNotes] = useState<CareerNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const result = await listNotes({ limit: 50 });
      setNotes(result.notes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
      await deleteNote(id);
      setNotes(notes.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete note");
    }
  };

  if (loading) {
    return <div className="text-slate-400">Loading notes...</div>;
  }

  if (error) {
    return <div className="text-red-400">{error}</div>;
  }

  if (notes.length === 0) {
    return <div className="text-slate-400">No notes yet. Create your first note above.</div>;
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div key={note.id} className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-white">{note.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>{note.topic || note.tags[0] || "General"}</span>
                <span className="h-1 w-1 rounded-full bg-slate-600" />
                <span>{Math.round(note.strength * 100)}% strength</span>
                {note.nextReviewAt && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-600" />
                    <span>Review {new Date(note.nextReviewAt).toLocaleDateString()}</span>
                  </>
                )}
              </div>
              <p className="mt-2 text-sm text-slate-300 line-clamp-3">{note.content}</p>
              {note.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span key={tag} className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {note.sourceUrl && (
                <a
                  href={note.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-xs text-cyan hover:underline"
                >
                  {note.sourceUrl}
                </a>
              )}
            </div>
            <div className="ml-4 flex gap-2">
              <button
                onClick={() => onEdit?.(note)}
                className="text-slate-400 hover:text-white"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="text-red-400 hover:text-red-300"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
