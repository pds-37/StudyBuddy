import { useState } from "react";
import { NotesList } from "./NotesList";
import { NoteForm } from "./NoteForm";
import type { CareerNote } from "@studybuddy/shared";

type ViewMode = "list" | "create" | "edit";

/** Main notes workspace component. */
export function NotesPlaceholder() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingNote, setEditingNote] = useState<CareerNote | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCreate = () => {
    setEditingNote(undefined);
    setViewMode("create");
  };

  const handleEdit = (note: CareerNote) => {
    setEditingNote(note);
    setViewMode("edit");
  };

  const handleSuccess = () => {
    setViewMode("list");
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCancel = () => {
    setViewMode("list");
  };

  if (viewMode === "create") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white text-white text-white">Create New Note</h2>
        </div>
        <NoteForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }

  if (viewMode === "edit" && editingNote) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-white text-white text-white">Edit Note</h2>
        </div>
        <NoteForm note={editingNote} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white text-white text-white">Your Notes</h2>
          <p className="text-slate-500 text-slate-500 text-slate-400">Capture and organize your learning resources.</p>
        </div>
        <button
          onClick={handleCreate}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white text-white text-white hover:bg-brand/90"
          type="button"
        >
          New Note
        </button>
      </div>
      <NotesList refreshTrigger={refreshTrigger} onEdit={handleEdit} />
    </div>
  );
}
