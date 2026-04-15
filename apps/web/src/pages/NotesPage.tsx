import { Fragment, useMemo, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Sparkles, Trash2 } from "lucide-react";

import LoadingScreen from "@/components/LoadingScreen";
import SurfaceCard from "@/components/SurfaceCard";
import { apiRequest } from "@/lib/api";
import { useUiStore } from "@/lib/ui-store";
import type { StudyNote } from "@shared";

type NotesResponse = {
  notes: StudyNote[];
};

function formatNoteTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function StructuredNoteView({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let tableLines: string[] = [];
  let inCode = false;

  const flushList = () => {
    if (!listItems.length) {
      return;
    }

    blocks.push(
      <ul key={`list-${blocks.length}`} className="notes-page__markdown-list">
        {listItems.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  const flushCode = () => {
    if (!codeLines.length) {
      return;
    }

    blocks.push(
      <pre key={`code-${blocks.length}`} className="notes-page__markdown-code">
        <code>{codeLines.join("\n")}</code>
      </pre>
    );
    codeLines = [];
  };

  const flushTable = () => {
    if (!tableLines.length) {
      return;
    }

    blocks.push(
      <pre key={`table-${blocks.length}`} className="notes-page__markdown-table">
        <code>{tableLines.join("\n")}</code>
      </pre>
    );
    tableLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushList();
      flushTable();
      if (inCode) {
        flushCode();
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (!trimmed) {
      flushList();
      flushTable();
      continue;
    }

    if (trimmed.startsWith("|")) {
      flushList();
      tableLines.push(line);
      continue;
    }

    flushTable();

    if (/^[-*]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*]\s+/, ""));
      continue;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h4 key={`h4-${blocks.length}`} className="notes-page__markdown-h4">
          {trimmed.slice(4)}
        </h4>
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="notes-page__markdown-h3">
          {trimmed.slice(3)}
        </h3>
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="notes-page__markdown-h2">
          {trimmed.slice(2)}
        </h2>
      );
      continue;
    }

    blocks.push(
      <p key={`p-${blocks.length}`} className="notes-page__markdown-p">
        {trimmed}
      </p>
    );
  }

  flushList();
  flushCode();
  flushTable();

  return <Fragment>{blocks}</Fragment>;
}

export default function NotesPage() {
  const queryClient = useQueryClient();
  const { openComposer } = useUiStore();
  const [search, setSearch] = useState("");
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);

  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: () => apiRequest<NotesResponse>("/notes")
  });

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) => apiRequest(`/notes/${noteId}`, { method: "DELETE" }),
    onSuccess: async (_, noteId) => {
      if (expandedNoteId === noteId) {
        setExpandedNoteId(null);
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notes"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["roadmap"] })
      ]);
    }
  });

  const visibleNotes = useMemo(() => {
    const notes = notesQuery.data?.notes ?? [];
    if (!search.trim()) {
      return notes;
    }

    const lower = search.toLowerCase();
    return notes.filter((note) =>
      [note.subject, note.category, note.summary, note.content, ...note.keyConcepts]
        .join(" ")
        .toLowerCase()
        .includes(lower)
    );
  }, [notesQuery.data?.notes, search]);

  const notesMeta = useMemo(() => {
    const subjects = new Set(visibleNotes.map((note) => note.subject));
    const concepts = visibleNotes.reduce((count, note) => count + note.keyConcepts.length, 0);
    return {
      total: visibleNotes.length,
      subjects: subjects.size,
      concepts
    };
  }, [visibleNotes]);

  if (notesQuery.isLoading) {
    return <LoadingScreen message="Loading notes..." />;
  }

  return (
    <div className="notes-page">
      <section className="notes-page__hero">
        <div className="notes-page__hero-copy">
          <p className="eyebrow">Study Buddy</p>
          <h1>Notes</h1>
          <p>Your saved study captures stay structured, searchable, and ready for revision.</p>
        </div>

        <div className="notes-page__hero-stats">
          <div className="notes-page__stat">
            <span>Notes</span>
            <strong>{notesMeta.total}</strong>
          </div>
          <div className="notes-page__stat">
            <span>Subjects</span>
            <strong>{notesMeta.subjects}</strong>
          </div>
          <div className="notes-page__stat">
            <span>Key ideas</span>
            <strong>{notesMeta.concepts}</strong>
          </div>
        </div>
      </section>

      <SurfaceCard
        className="notes-page__panel"
        title="Saved notes"
        subtitle={`${visibleNotes.length} results`}
        action={
          <div className="notes-page__toolbar">
            <input className="search-input notes-page__search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search notes, concepts, or topics" />
            <button className="primary-button" onClick={() => openComposer()}>
              New Note
            </button>
          </div>
        }
      >
        {visibleNotes.length ? (
          <div className="notes-page__list">
            {visibleNotes.map((note) => {
              const expanded = expandedNoteId === note.id;
              return (
                <article key={note.id} className={`notes-page__card ${expanded ? "is-expanded" : ""}`}>
                  <div className="notes-page__card-top">
                    <div className="note-card__tags">
                      <span className="badge">{note.subject}</span>
                      <span className="badge badge--secondary">{note.category}</span>
                    </div>

                    <div className="notes-page__card-actions">
                      <button
                        className="ghost-icon-button"
                        onClick={() => setExpandedNoteId(expanded ? null : note.id)}
                        aria-label={expanded ? "Collapse note" : "Expand note"}
                      >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <button className="ghost-icon-button" onClick={() => deleteMutation.mutate(note.id)} aria-label="Delete note">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="notes-page__summary">
                    <div className="notes-page__summary-icon">
                      <Sparkles size={16} />
                    </div>
                    <p>{note.summary}</p>
                  </div>

                  <div className="notes-page__meta">
                    <span>{formatNoteTimestamp(note.createdAt)}</span>
                    <span>{note.confidence}% match</span>
                  </div>

                  {expanded ? (
                    <div className="notes-page__expanded">
                      {note.keyConcepts.length ? (
                        <div className="notes-page__concepts">
                          {note.keyConcepts.map((concept) => (
                            <span key={concept} className="badge badge--secondary">
                              {concept}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="notes-page__full-note">
                        <strong>Full note</strong>
                        <div className="notes-page__full-note-body">
                          <StructuredNoteView content={note.content} />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="notes-page__empty">
            <strong>No notes found</strong>
            <p>Start a new note and Buddy will turn it into a cleaner study artifact.</p>
          </div>
        )}
      </SurfaceCard>
    </div>
  );
}
