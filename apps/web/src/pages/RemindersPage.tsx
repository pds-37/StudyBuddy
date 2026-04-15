import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import LoadingScreen from "@/components/LoadingScreen";
import SurfaceCard from "@/components/SurfaceCard";
import { apiRequest } from "@/lib/api";
import type { LearningItem, ReminderItem, ReviewOutcome } from "@shared";

type RemindersResponse = {
  reminders: ReminderItem[];
  revisionQueue: LearningItem[];
};

export default function RemindersPage() {
  const queryClient = useQueryClient();
  const remindersQuery = useQuery({
    queryKey: ["reminders"],
    queryFn: () => apiRequest<RemindersResponse>("/reminders")
  });

  const reviewMutation = useMutation({
    mutationFn: ({ itemId, outcome }: { itemId: string; outcome: ReviewOutcome }) =>
      apiRequest(`/reminders/revision/${itemId}`, {
        method: "POST",
        json: { outcome }
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["reminders"] }),
        queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      ]);
    }
  });

  if (remindersQuery.isLoading) {
    return <LoadingScreen message="Loading reminders..." />;
  }

  const dueItems = remindersQuery.data?.revisionQueue ?? [];
  const reminders = remindersQuery.data?.reminders ?? [];

  return (
    <div className="page-grid">
      <SurfaceCard title="Revision" subtitle={dueItems.length ? `${dueItems.length} items due now` : "Queue clear for now"}>
        {dueItems.length ? (
          <div className="stack-list">
            {dueItems.map((item) => (
              <div key={item.id} className="revision-card">
                <div>
                  <strong>{item.topic}</strong>
                  <p>
                    {item.subject} · {item.kind.replace("_", " ")}
                  </p>
                </div>
                <div className="revision-card__actions">
                  <button
                    className="ghost-button"
                    onClick={() => reviewMutation.mutate({ itemId: item.id, outcome: "wrong" })}
                    disabled={reviewMutation.isPending}
                  >
                    Wrong
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => reviewMutation.mutate({ itemId: item.id, outcome: "correct" })}
                    disabled={reviewMutation.isPending}
                  >
                    Correct
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-copy">No revision pressure right now. Add notes to keep the queue alive.</p>
        )}
      </SurfaceCard>

      <SurfaceCard title="Scheduled reminders" subtitle={`${reminders.length} entries`}>
        {reminders.length ? (
          <div className="stack-list">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="list-row">
                <div>
                  <strong>{reminder.title}</strong>
                  <p>{new Date(reminder.scheduledAt).toLocaleString()}</p>
                </div>
                <span className={`badge ${reminder.isReviewed ? "" : "badge--warning"}`}>
                  {reminder.isReviewed ? "Done" : "Scheduled"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-copy">No scheduled reminders yet.</p>
        )}
      </SurfaceCard>
    </div>
  );
}
