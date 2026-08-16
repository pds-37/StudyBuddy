import { useState } from "react";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export function StartInterviewButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const launch = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token") || localStorage.getItem("token");
      const res = await fetch(`${API}/api/mockhire/token`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const { redirect_url } = await res.json();
      window.location.href = redirect_url;
    } catch {
      setError("Could not launch interview. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button 
        onClick={launch} 
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Launching..." : "🎙️ Start MockHire AI Interview"}
      </button>
      {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
    </div>
  );
}
