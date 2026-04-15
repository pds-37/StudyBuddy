import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import LoadingScreen from "@/components/LoadingScreen";
import SurfaceCard from "@/components/SurfaceCard";
import { apiRequest } from "@/lib/api";
import type { StudyNote } from "@shared";

type NotesResponse = {
  notes: StudyNote[];
};

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const notesQuery = useQuery({
    queryKey: ["notes"],
    queryFn: () => apiRequest<NotesResponse>("/notes")
  });

  const groupedNotes = useMemo(() => {
    const groups = new Map<string, StudyNote[]>();
    (notesQuery.data?.notes ?? []).forEach((note) => {
      const haystack = [note.subject, note.category, note.summary, ...note.keyConcepts].join(" ").toLowerCase();
      if (search.trim() && !haystack.includes(search.toLowerCase())) {
        return;
      }

      const key = note.subject;
      groups.set(key, [...(groups.get(key) ?? []), note]);
    });

    return Array.from(groups.entries());
  }, [notesQuery.data?.notes, search]);

  if (notesQuery.isLoading) {
    return <LoadingScreen message="Loading library..." />;
  }

  return (
    <div className="page-grid">
      <SurfaceCard
        title="Library"
        subtitle={`${groupedNotes.length} subject groups`}
        action={<input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" />}
      >
        {groupedNotes.length ? (
          groupedNotes.map(([subject, notes]) => (
            <div key={subject} className="library-group">
              <div className="library-group__header">
                <h3>{subject}</h3>
                <span>{notes.length}</span>
              </div>
              <div className="stack-list">
                {notes.map((note) => (
                  <div key={note.id} className="list-row">
                    <div>
                      <strong>{note.category}</strong>
                      <p>{note.summary}</p>
                    </div>
                    <span className="badge badge--secondary">{note.keyConcepts[0] ?? "General"}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="empty-copy">Library is empty.</p>
        )}
      </SurfaceCard>
    </div>
  );
}
