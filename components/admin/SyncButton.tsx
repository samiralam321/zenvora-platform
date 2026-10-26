"use client";

import React, { useState } from "react";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch("/api/admin/youtube/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to synchronize channel.");
      }
      setMessage(data.message || "Channel synchronized successfully!");
      router.refresh();
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setError(err.message || "An error occurred.");
      setTimeout(() => setError(null), 4000);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-lg flex items-center gap-2 shadow-xs transition-colors"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-[#1D64EC] ${syncing ? "animate-spin" : ""}`} />
        <span>{syncing ? "Syncing..." : "Sync Channel Now"}</span>
      </button>

      {message && (
        <div className="absolute top-full right-0 mt-2 z-30 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs whitespace-nowrap shadow-lg flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="absolute top-full right-0 mt-2 z-30 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs whitespace-nowrap shadow-lg flex items-center gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
