"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Edit,
  Save,
  Loader2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface SectionItem {
  id: string;
  type: string;
  order: number;
  visible: boolean;
  data: string;
}

export default function AdminSectionsPage() {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [successMsg, setSuccessMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/sections")
      .then((r) => r.json())
      .then((data) => {
        if (data.sections) setSections(data.sections);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load sections");
        setLoading(false);
      });
  }, []);

  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Recalculate orders
    const reordered = updated.map((sec, i) => ({
      ...sec,
      order: i + 1,
    }));

    setSections(reordered);
  };

  const toggleVisibility = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    );
  };

  const startEdit = (sec: SectionItem) => {
    setEditingId(sec.id);
    try {
      setEditFormData(JSON.parse(sec.data));
    } catch (e) {
      setEditFormData({});
    }
  };

  const saveEdit = () => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === editingId ? { ...s, data: JSON.stringify(editFormData) } : s
      )
    );
    setEditingId(null);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSuccessMsg(false);
    setError(null);

    try {
      const res = await fetch("/api/admin/sections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to save sections");
    } finally {
      setSaving(false);
    }
  };

  const getSectionTitle = (type: string) => {
    switch (type) {
      case "hero":
        return "1. Hero Section (Headline, Subtext & CTA Buttons)";
      case "categories":
        return "2. Learning Domains (Web Dev, Backend, Full Stack, AI/ML, GenAI)";
      case "tutorials":
        return "3. Curated Lectures Preview";
      case "tools":
        return "4. Essential Developer Tools";
      case "banner":
        return "5. Student Resources & Roadmaps Banner";
      case "about":
        return "6. Why Zenvora? (Mission & Student Sanctuary)";
      case "cta":
        return "7. Final Platform CTA & Community";
      case "footer":
        return "9. Footer & Navigation Structure";
      default:
        return type.toUpperCase();
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
            Visual Page Architecture
          </span>
          <h1 className="font-serif text-3xl font-bold text-ivory tracking-tight mt-1">
            Home Page Builder
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Reorder, toggle, and customize all home page sections. Any change appears live instantly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="secondary-pill text-xs uppercase tracking-wider font-semibold py-2.5 px-4"
          >
            <span>Preview Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-gold" />
          </Link>

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="gold-btn text-xs uppercase tracking-wider font-semibold py-2.5 px-6 shadow-gold-glow/30"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-ink" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-ink" />
                <span>Save All Sections</span>
              </>
            )}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Home page section arrangement and content saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((sec, idx) => {
          let parsedData: any = {};
          try {
            parsedData = JSON.parse(sec.data);
          } catch (e) {}

          const isEditing = editingId === sec.id;

          return (
            <div
              key={sec.id}
              className={`luxury-card p-5 transition-all ${
                !sec.visible ? "opacity-50 border-white/5" : "border-gold/25"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center font-bold text-xs font-mono">
                    #{sec.order}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-ivory">
                      {getSectionTitle(sec.type)}
                    </h3>
                    <span className="text-[11px] text-muted font-mono">
                      type: {sec.type} &bull; {sec.visible ? "Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveSection(idx, "up")}
                    disabled={idx === 0}
                    className="p-2 rounded-lg border border-gold/15 text-ivory hover:text-gold disabled:opacity-20 transition-colors"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => moveSection(idx, "down")}
                    disabled={idx === sections.length - 1}
                    className="p-2 rounded-lg border border-gold/15 text-ivory hover:text-gold disabled:opacity-20 transition-colors"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleVisibility(sec.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      sec.visible
                        ? "border-gold/25 text-gold hover:bg-gold/10"
                        : "border-white/10 text-muted hover:text-ivory"
                    }`}
                    title={sec.visible ? "Hide Section" : "Show Section"}
                  >
                    {sec.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => (isEditing ? setEditingId(null) : startEdit(sec))}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isEditing
                        ? "border-gold bg-gold text-ink"
                        : "border-gold/20 text-gold hover:bg-gold/10"
                    }`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{isEditing ? "Close" : "Edit Content"}</span>
                  </button>
                </div>
              </div>

              {/* In-place content editor */}
              {isEditing && (
                <div className="mt-5 pt-5 border-t border-gold/15 space-y-4 animate-in fade-in">
                  <span className="text-xs uppercase tracking-wider text-gold font-semibold block">
                    Edit {sec.type.toUpperCase()} Section Content
                  </span>

                  {sec.type === "hero" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          H1 Main Headline
                        </label>
                        <input
                          type="text"
                          value={editFormData.h1 || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, h1: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Subtext
                        </label>
                        <textarea
                          rows={2}
                          value={editFormData.subtext || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, subtext: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Primary Button Label
                        </label>
                        <input
                          type="text"
                          value={editFormData.primaryBtn || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, primaryBtn: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Secondary Button Label
                        </label>
                        <input
                          type="text"
                          value={editFormData.secondaryBtn || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, secondaryBtn: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  )}

                  {sec.type === "banner" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Banner Heading
                        </label>
                        <input
                          type="text"
                          value={editFormData.heading || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, heading: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={editFormData.buttonText || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, buttonText: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Subtext
                        </label>
                        <textarea
                          rows={2}
                          value={editFormData.subtext || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, subtext: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {sec.type === "about" && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Paragraph 1
                        </label>
                        <textarea
                          rows={2}
                          value={editFormData.paragraph1 || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, paragraph1: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Paragraph 2
                        </label>
                        <textarea
                          rows={2}
                          value={editFormData.paragraph2 || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, paragraph2: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-ivory/80 mb-1">
                            Collaborations Heading
                          </label>
                          <input
                            type="text"
                            value={editFormData.collabHeading || ""}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                collabHeading: e.target.value,
                              })
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-ivory/80 mb-1">
                            Contact Email
                          </label>
                          <input
                            type="email"
                            value={editFormData.email || ""}
                            onChange={(e) =>
                              setEditFormData({ ...editFormData, email: e.target.value })
                            }
                            className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {sec.type === "cta" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          CTA Heading
                        </label>
                        <input
                          type="text"
                          value={editFormData.heading || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, heading: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Subtext
                        </label>
                        <textarea
                          rows={2}
                          value={editFormData.subtext || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, subtext: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={editFormData.buttonText || ""}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, buttonText: e.target.value })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ivory/80 mb-1">
                          Telegram Sublink Text
                        </label>
                        <input
                          type="text"
                          value={editFormData.telegramText || ""}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              telegramText: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                        />
                      </div>
                    </div>
                  )}

                  {/* Fallback general JSON editor for custom sections */}
                  {!["hero", "banner", "about", "cta"].includes(sec.type) && (
                    <div>
                      <label className="block text-xs font-medium text-ivory/80 mb-1">
                        Section JSON Data
                      </label>
                      <textarea
                        rows={4}
                        value={JSON.stringify(editFormData, null, 2)}
                        onChange={(e) => {
                          try {
                            setEditFormData(JSON.parse(e.target.value));
                          } catch (err) {}
                        }}
                        className="w-full p-3 rounded-xl bg-black/60 border border-gold/20 text-gold text-xs font-mono focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl border border-white/10 text-muted hover:text-ivory text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="gold-btn text-xs uppercase tracking-wider font-semibold py-2 px-5"
                    >
                      Done Editing
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
