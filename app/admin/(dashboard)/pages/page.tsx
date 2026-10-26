"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Save,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function AdminPagesManager() {
  const [pages, setPages] = useState<any[]>([]);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pages")
      .then((r) => r.json())
      .then((data) => {
        if (data.pages && data.pages.length > 0) {
          setPages(data.pages);
          setSelectedPage(data.pages[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedPage),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(`${selectedPage.title} saved and revalidated!`);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center text-gold">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold/15">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Legal & Static Pages
          </span>
          <h1 className="font-serif text-3xl font-bold text-ivory tracking-tight mt-1">
            Pages Manager
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Edit Privacy Policy, Terms & Conditions, and Disclaimer copy and SEO metadata.
          </p>
        </div>

        {selectedPage && (
          <a
            href={`/${selectedPage.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-pill text-xs uppercase tracking-wider font-semibold py-2.5 px-4"
          >
            <span>View /{selectedPage.slug}</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
          </a>
        )}
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPage(p)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
              selectedPage?.id === p.id
                ? "bg-gold text-ink"
                : "text-muted hover:text-ivory hover:bg-white/5"
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Form */}
      {selectedPage && (
        <form onSubmit={handleSave} className="luxury-card p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1">
                Page Title
              </label>
              <input
                type="text"
                value={selectedPage.title}
                onChange={(e) =>
                  setSelectedPage({ ...selectedPage, title: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1">
                URL Slug
              </label>
              <input
                type="text"
                disabled
                value={`/${selectedPage.slug}`}
                className="w-full px-3 py-2 rounded-xl bg-ink/40 border border-white/10 text-muted text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ivory/80 mb-1">
              Meta SEO Description
            </label>
            <input
              type="text"
              value={selectedPage.metaDescription || ""}
              onChange={(e) =>
                setSelectedPage({
                  ...selectedPage,
                  metaDescription: e.target.value,
                })
              }
              className="w-full px-3 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ivory/80 mb-1">
              Page Markdown / Rich Body Content
            </label>
            <textarea
              rows={16}
              value={selectedPage.content || ""}
              onChange={(e) =>
                setSelectedPage({ ...selectedPage, content: e.target.value })
              }
              className="w-full p-4 rounded-xl bg-black/60 border border-gold/20 text-stone text-xs font-mono leading-relaxed focus:outline-none focus:border-gold"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="gold-btn text-xs uppercase tracking-wider font-semibold py-3 px-8 shadow-gold-glow"
            >
              {saving ? "Saving..." : "Save Page Content"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
