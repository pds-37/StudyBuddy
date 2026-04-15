import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";

import { ApiError, apiRequest } from "@/lib/api";
import { useUiStore } from "@/lib/ui-store";
import { defaultSubjectSuggestions } from "@shared";

type CreateNoteResponse = {
  note: {
    id: string;
  };
  warning?: string;
};

export default function ComposerModal() {
  const queryClient = useQueryClient();
  const { composerOpen, composerSeed, closeComposer } = useUiStore();
  const [content, setContent] = useState("");
  const [subjectHint, setSubjectHint] = useState<string>("");
  const [analyse, setAnalyse] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!composerOpen) {
      return;
    }

    setContent(composerSeed?.content ?? "");
    setSubjectHint(composerSeed?.subjectHint ?? "");
  }, [composerOpen, composerSeed]);

  const createMutation = useMutation({
    mutationFn: () =>
      apiRequest<CreateNoteResponse>("/notes", {
        method: "POST",
        json: {
          content,
          subjectHint,
          analyse
        }
      }),
    onSuccess: async () => {
      setContent("");
      setSubjectHint("");
      setAnalyse(true);
      setErrorMessage("");
      closeComposer();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notes"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    },
    onError: (error) => {
      setErrorMessage(error instanceof ApiError ? error.message : "Could not save the note.");
    }
  });

  const helperText = useMemo(() => {
    if (createMutation.isPending) {
      return "Buddy is reading your note...";
    }

    return analyse
      ? "Save with Gemini analysis so Buddy auto-tags it."
      : "Save instantly as a raw study capture.";
  }, [analyse, createMutation.isPending]);

  if (!composerOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={closeComposer}>
      <div className="composer-modal" onClick={(event) => event.stopPropagation()}>
        <div className="composer-modal__header">
          <div>
            <p className="eyebrow">Quick Capture</p>
            <h2>New note</h2>
            <p className="composer-modal__subcopy">Capture the session once. Buddy can structure it for you.</p>
          </div>
          <button className="ghost-icon-button" onClick={closeComposer} aria-label="Close composer">
            <X size={18} />
          </button>
        </div>

        <div className="composer-modal__body">
          <textarea
            className="composer-modal__textarea composer-modal__textarea--premium"
            placeholder="Write what you learned, what you solved, and what still feels unclear..."
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <div className="composer-modal__grid">
            <label className="field composer-modal__field">
              <span>Subject hint</span>
              <input
                list="subject-suggestions"
                value={subjectHint}
                onChange={(event) => setSubjectHint(event.target.value)}
                placeholder="Optional subject or course"
              />
              <datalist id="subject-suggestions">
                {defaultSubjectSuggestions.map((subject) => (
                  <option key={subject} value={subject} />
                ))}
              </datalist>
            </label>

            <label className={`composer-modal__toggle ${analyse ? "is-active" : ""}`}>
              <input type="checkbox" checked={analyse} onChange={(event) => setAnalyse(event.target.checked)} />
              <div>
                <strong>Analyze with Gemini</strong>
                <p>Auto-structure the note, tag the topic, and make it revision-ready.</p>
              </div>
            </label>
          </div>
        </div>

        <p className="composer-modal__helper">{errorMessage || helperText}</p>

        <div className="composer-modal__actions">
          <button className="ghost-button" onClick={closeComposer}>
            Cancel
          </button>
          <button
            className="primary-button"
            onClick={() => createMutation.mutate()}
            disabled={!content.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? "Saving..." : "Save Note"}
          </button>
        </div>
      </div>
    </div>
  );
}
