import { useState } from "react";
import { Star, Send, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils/cn";
import { useRoadmapsStore } from "../../../store/roadmaps-store";

type RoadmapRatingProps = {
  roadmapId: string;
  initialRating?: number;
  initialFeedback?: string;
};

export function RoadmapRating({ roadmapId, initialRating, initialFeedback }: RoadmapRatingProps) {
  const [rating, setRating] = useState(initialRating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState(initialFeedback || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(Boolean(initialRating));
  const rateRoadmap = useRoadmapsStore((state) => state.rateRoadmap);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await rateRoadmap(roadmapId, rating, feedback);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to rate roadmap:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted && !isSubmitting) {
    return (
      <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-green-400">
          <CheckCircle2 size={24} />
        </div>
        <h4 className="text-sm font-semibold text-white text-white text-white">Feedback Received!</h4>
        <p className="mt-1 text-xs text-slate-500 text-slate-500 text-slate-400">Thank you for helping us improve your learning path.</p>
        <div className="mt-4 flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={cn(star <= rating ? "fill-green-400 text-green-400" : "text-slate-300")}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm">
      <div className="mb-6 text-center">
        <h3 className="text-lg font-semibold text-white text-white text-white">How is this roadmap?</h3>
        <p className="mt-1 text-sm text-slate-500 text-slate-500 text-slate-400">Your feedback helps the AI create better paths for everyone.</p>
      </div>

      <div className="mb-8 flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
            className="group relative transition-transform hover:scale-110 active:scale-95"
          >
            <Star
              size={32}
              className={cn(
                "transition-colors duration-200",
                star <= (hoveredRating || rating)
                  ? "fill-cyan text-cyan shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  : "text-slate-300 group-hover:text-slate-500"
              )}
            />
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Any specific thoughts? (e.g., too fast, missing key topics, great resources...)"
          className="w-full min-h-[100px] rounded-xl border border-white/[0.06] bg-black/20 p-4 text-sm text-white text-white text-white placeholder-slate-600 focus:border-cyan/50 focus:outline-none focus:ring-1 focus:ring-cyan/50 transition-all"
        />

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-transparent px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:bg-cyan hover:text-white text-white text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-950"
        >
          {isSubmitting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <>
              Submit Feedback
              <Send size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
