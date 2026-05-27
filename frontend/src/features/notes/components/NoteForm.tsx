import { useState, useEffect } from "react";
import { createNote, updateNote } from "../../../lib/api/notes";
import { GuestGuard } from "../../../components/auth/GuestGuard";
import type { CareerNote } from "@studybuddy/shared";

type NoteFormProps = {
  note?: CareerNote;
  onSuccess: () => void;
  onCancel: () => void;
};

/** Form for creating or editing a note. */
export function NoteForm({ note, onSuccess, onCancel }: NoteFormProps) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [topic, setTopic] = useState(note?.topic ?? "");
  const [tags, setTags] = useState(note?.tags.join(", ") ?? "");
  const [linkedSkills, setLinkedSkills] = useState(note?.linkedSkills.join(", ") ?? "");
  const [sourceUrl, setSourceUrl] = useState(note?.sourceUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!note;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = {
        title: title.trim(),
        content: content.trim(),
        topic: topic.trim() || undefined,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        linkedSkills: linkedSkills.split(",").map((skill) => skill.trim()).filter(Boolean),
        sourceUrl: sourceUrl.trim() || undefined
      };

      if (isEditing) {
        await updateNote(note.id, data);
      } else {
        await createNote(data);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard fallbackText="Please login to create and save notes to your knowledge base. Let's learn and grow together.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-red-400">{error}</div>}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-300">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-400 focus:border-brand focus:outline-none"
            placeholder="Note title"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-slate-300">
            Content *
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-400 focus:border-brand focus:outline-none"
            placeholder="Write your note content here..."
            required
          />
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-300">
            Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-400 focus:border-brand focus:outline-none"
            placeholder="closures, dynamic programming, system design"
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-slate-300">
            Tags (comma-separated)
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-400 focus:border-brand focus:outline-none"
            placeholder="javascript, react, tutorial"
          />
        </div>

        <div>
          <label htmlFor="linkedSkills" className="block text-sm font-medium text-slate-300">
            Linked Skills (comma-separated)
          </label>
          <input
            id="linkedSkills"
            type="text"
            value={linkedSkills}
            onChange={(e) => setLinkedSkills(e.target.value)}
            className="mt-1 block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-400 focus:border-brand focus:outline-none"
            placeholder="JavaScript, React, TypeScript"
          />
        </div>

        <div>
          <label htmlFor="sourceUrl" className="block text-sm font-medium text-slate-300">
            Source URL
          </label>
          <input
            id="sourceUrl"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="mt-1 block w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-white placeholder-slate-400 focus:border-brand focus:outline-none"
            placeholder="https://example.com"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditing ? "Update Note" : "Create Note"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </form>
    </GuestGuard>
  );
}
