import { apiClient } from "./client";

/** Sync status returned by the backend. */
export type SyncStatus = {
  last_push: string | null;
  last_pull: string | null;
  total_notes: number;
  user_id: string;
};

/** Shape of a synced note from the pull endpoint. */
export type SyncedNote = {
  note_id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  source: "cli" | "web";
  created_at: string;
  updated_at: string;
  synced_at: string | null;
  deleted: boolean;
  deleted_at: string | null;
};

/** Push result from the sync endpoint. */
export type SyncPushResult = {
  accepted: string[];
  rejected: Array<{ note_id: string; reason: string }>;
  conflicts: Array<{ note_id: string; server_version: SyncedNote }>;
};

/** Fetches sync bridge status. */
export async function getSyncStatus(): Promise<SyncStatus> {
  const response = await apiClient.get<SyncStatus>("/sync/status");
  return response.data;
}

/** Pulls notes that have changed since the given timestamp. */
export async function pullSyncedNotes(since?: string): Promise<{ notes: SyncedNote[] }> {
  const params = since ? { since } : {};
  const response = await apiClient.get<{ notes: SyncedNote[] }>("/sync/notes/pull", { params });
  return response.data;
}

/** Pushes notes to the sync bridge (used by web to push to CLI). */
export async function pushSyncNotes(
  notes: SyncedNote[],
  lastSync?: string | null
): Promise<SyncPushResult> {
  const response = await apiClient.post<SyncPushResult>("/sync/notes", {
    notes,
    last_sync: lastSync ?? null,
  });
  return response.data;
}
