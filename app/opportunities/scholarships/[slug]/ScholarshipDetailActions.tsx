"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Bookmark, Share2, Check } from "lucide-react";

export default function ScholarshipDetailActions({
  scholarshipId,
  scholarshipSlug,
  applicationUrl,
  officialUrl,
}: {
  scholarshipId: string;
  scholarshipSlug: string;
  applicationUrl?: string | null;
  officialUrl?: string | null;
}) {
  const [isSaved, setIsSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zenvora_saved_scholarships");
      if (stored) {
        const arr = JSON.parse(stored);
        if (arr.includes(scholarshipId)) setIsSaved(true);
      }
    } catch {}
  }, [scholarshipId]);

  const toggleSave = () => {
    try {
      const stored = localStorage.getItem("zenvora_saved_scholarships");
      let arr: string[] = stored ? JSON.parse(stored) : [];
      if (arr.includes(scholarshipId)) {
        arr = arr.filter((id) => id !== scholarshipId);
        setIsSaved(false);
      } else {
        arr.push(scholarshipId);
        setIsSaved(true);
      }
      localStorage.setItem("zenvora_saved_scholarships", JSON.stringify(arr));
    } catch {}
  };

  const handleShare = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
      {applicationUrl && (
        <a
          href={applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#1D64EC] hover:bg-[#1a56d4] text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl transition shadow-xs flex items-center gap-2"
        >
          <span>Apply on Official Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}

      {officialUrl && (
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl transition flex items-center gap-2"
        >
          <span>Official Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      )}

      <button
        onClick={toggleSave}
        className={`p-2.5 rounded-xl border transition ${
          isSaved
            ? "bg-amber-50 text-amber-600 border-amber-300"
            : "border-slate-200 text-slate-600 hover:bg-slate-50"
        }`}
        title={isSaved ? "Saved to Bookmarks" : "Save Scholarship"}
      >
        <Bookmark className={`w-4 h-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
      </button>

      <button
        onClick={handleShare}
        className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        title="Share link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-600" />
        ) : (
          <Share2 className="w-4 h-4 text-slate-500" />
        )}
      </button>
    </div>
  );
}
