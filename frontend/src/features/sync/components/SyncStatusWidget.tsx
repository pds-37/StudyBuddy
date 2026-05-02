import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Cloud, CloudOff, Monitor, ArrowUpDown, CheckCircle2 } from "lucide-react";
import { getSyncStatus, type SyncStatus } from "../../../lib/api/sync";
import { cn } from "../../../lib/utils/cn";

/** Formats an ISO timestamp to a human-readable relative string. */
function timeAgo(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SyncStatusWidget() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSyncStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err?.response?.status === 401 ? "Not authenticated" : "Sync bridge offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const isConnected = status !== null && !error;

  return (
    <div className="p-6 rounded-2xl glass border-white/5 hover:border-white/10 transition-all">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-lg",
            isConnected ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
          )}>
            {isConnected ? <Cloud size={18} /> : <CloudOff size={18} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">CLI Sync Bridge</h3>
            <p className={cn(
              "text-[11px] font-medium mt-0.5",
              isConnected ? "text-emerald-400" : "text-red-400"
            )}>
              {isConnected ? "Connected" : error ?? "Offline"}
            </p>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="p-2 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          title="Refresh sync status"
        >
          <RefreshCw size={14} className={cn(loading && "animate-spin")} />
        </button>
      </div>

      {status && (
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]">
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <ArrowUpDown size={12} className="text-cyan" />
              Last Push
            </div>
            <span className="text-xs font-medium text-slate-300">
              {timeAgo(status.last_push)}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03]">
            <div className="flex items-center gap-2.5 text-xs text-slate-400">
              <Monitor size={12} className="text-purple-400" />
              Cloud Notes
            </div>
            <span className="text-xs font-medium text-slate-300">
              {status.total_notes}
            </span>
          </div>

          {status.last_push && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <p className="text-[11px] text-slate-500">
                CLI agent syncing to this account
              </p>
            </div>
          )}
        </div>
      )}

      {!status && !loading && (
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Install the CLI agent to sync notes offline. 
          Run <code className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 font-mono text-slate-400">studybuddy sync status</code> to connect.
        </p>
      )}
    </div>
  );
}
