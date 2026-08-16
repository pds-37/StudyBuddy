import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export function InterviewResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<any>(null);
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const encoded = searchParams.get("data");
    if (!encoded) {
      setError("No result data received.");
      setSaving(false);
      return;
    }

    try {
      const decoded = JSON.parse(atob(encoded));
      setResult(decoded);
      saveToDatabase(decoded);
    } catch {
      setError("Invalid result data.");
      setSaving(false);
    }
  }, []);

  const saveToDatabase = async (data: any) => {
    try {
      const token = localStorage.getItem("studybuddy_access_token");
      await fetch(`${API}/api/mockhire/save-result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.warn("Could not save result to database", err);
    }
    setSaving(false);
  };

  if (saving) return <div className="p-8 text-center text-white">Saving your interview results...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!result) return null;

  const SCORE_COLOR = (s: number) =>
    s >= 8 ? "#16a34a" : s >= 6 ? "#ca8a04" : s >= 4 ? "#ea580c" : "#dc2626";

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-[#111111] rounded-xl border border-[#333333] text-white">
      <h1 className="text-3xl font-bold mb-2">Interview Complete 🎉</h1>
      <p className="text-gray-400 mb-6">
        {result.interview_type === "tech" ? "Technical" : "HR"} Interview ·{" "}
        {new Date(result.completed_at).toLocaleDateString()}
      </p>

      <div className="mb-8 flex items-end gap-2">
        <span className="text-6xl font-black" style={{ color: SCORE_COLOR(result.overall) }}>
          {result.overall}
        </span>
        <span className="text-xl text-gray-500 mb-2">/10</span>
      </div>

      <div className="space-y-4 mb-8">
        {[
          ["Communication", result.communication],
          ["Confidence", result.confidence],
          ["Technical", result.technical],
          ["Grammar", result.grammar],
        ].map(([label, score]) => (
          <div key={label as string} className="flex items-center gap-4">
            <span className="w-32 text-sm text-gray-300">{label}</span>
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full" 
                style={{ width: `${(score as number / 10) * 100}%`, backgroundColor: SCORE_COLOR(score as number) }} 
              />
            </div>
            <span className="text-sm font-bold w-10 text-right" style={{ color: SCORE_COLOR(score as number) }}>
              {score}/10
            </span>
          </div>
        ))}
      </div>

      {result.summary && (
        <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] mb-8">
          <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">AI Feedback</div>
          <p className="text-gray-300 leading-relaxed text-sm">{result.summary}</p>
        </div>
      )}

      {/* Visual Timeline Mock */}
      <div className="p-4 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] mb-8">
        <div className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Interview Timeline</div>
        <div className="flex w-full h-3 rounded-full overflow-hidden bg-gray-800 gap-0.5">
          <div className="h-full bg-green-500 hover:bg-green-400 cursor-pointer" style={{ width: '25%' }} title="0:00 - Introduction (Strong)" />
          <div className="h-full bg-orange-500 hover:bg-orange-400 cursor-pointer" style={{ width: '40%' }} title="0:25 - Technical Deep Dive (Hesitation)" />
          <div className="h-full bg-red-500 hover:bg-red-400 cursor-pointer" style={{ width: '15%' }} title="0:65 - System Design (Struggled)" />
          <div className="h-full bg-green-500 hover:bg-green-400 cursor-pointer" style={{ width: '20%' }} title="0:80 - Closing (Strong)" />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-mono text-gray-500">
          <span>0:00</span>
          <span>End</span>
        </div>
        <p className="text-xs text-gray-400 mt-3 italic">Hover over segments to see contextual feedback.</p>
      </div>

      <button
        onClick={() => navigate("/app/interview")}
        className="px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-gray-200 transition-colors"
      >
        Back to Interviews →
      </button>
    </div>
  );
}
