"use client";

import React, { useState } from "react";
import {
  Database,
  Download,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminBackupPage() {
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm("Restoring a backup will overwrite current sections and settings. Proceed?")) {
      return;
    }

    setRestoring(true);
    setMessage(null);
    setError(null);

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Restore failed");

      setMessage("Database backup restored successfully! All pages revalidated.");
    } catch (err: any) {
      setError(err.message || "Invalid backup JSON file.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-gold/15">
        <span className="text-xs uppercase tracking-widest text-gold font-semibold">
          Data Portability & Disaster Recovery
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory tracking-tight mt-1">
          Backup & Restore
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-0.5">
          Export your entire site content, sections, videos, and settings as a standalone JSON file, or restore from a previous snapshot.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="luxury-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-4">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-ivory mb-2">
              Export Site Content
            </h3>
            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              Downloads a complete JSON snapshot including all site settings, navigation links, home sections, video records, tools, gear, and legal documentation.
            </p>
          </div>

          <a
            href="/api/admin/backup"
            className="gold-btn w-full justify-center text-xs uppercase tracking-wider font-semibold py-3 shadow-gold-glow/30"
          >
            <Download className="w-4 h-4 text-ink" />
            <span>Download JSON Snapshot</span>
          </a>
        </div>

        {/* Restore Card */}
        <div className="luxury-card p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-ivory mb-2">
              Restore from Backup
            </h3>
            <p className="text-muted text-xs sm:text-sm leading-relaxed">
              Upload an exported JSON backup file to instantly restore all sections, settings, and media records.
            </p>
          </div>

          <div>
            <label className="secondary-pill w-full justify-center text-xs uppercase tracking-wider font-semibold py-3 cursor-pointer">
              {restoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  <span>Restoring...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-gold" />
                  <span>Select JSON File</span>
                </>
              )}
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                disabled={restoring}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
