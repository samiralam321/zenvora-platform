"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Wrench,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  CheckCircle2,
  X,
  Youtube,
} from "lucide-react";

export default function AdminToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchTools = async () => {
    try {
      const res = await fetch("/api/admin/tools");
      const data = await res.json();
      if (data.tools) setTools(data.tools);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingTool({
      name: "",
      logo: "",
      oneLiner: "",
      description: "",
      tag: "Code Editor",
      url: "",
      youtubeUrl: "",
      showOnHome: true,
      order: tools.length + 1,
    });
  };

  const handleAutoFavicon = () => {
    if (!editingTool?.url) return;
    try {
      const domain = new URL(editingTool.url).hostname;
      setEditingTool({
        ...editingTool,
        logo: `https://icons.duckduckgo.com/ip3/${domain}.ico`,
      });
    } catch (e) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool?.name || !editingTool?.url) return;

    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/tools", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTool),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(isNew ? "Developer tool added!" : "Developer tool updated!");
      setEditingTool(null);
      setIsNew(false);
      fetchTools();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save tool");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tool?")) return;
    try {
      await fetch(`/api/admin/tools?id=${id}`, { method: "DELETE" });
      setTools((prev) => prev.filter((t) => t.id !== id));
      setMessage("Tool deleted");
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center text-[#1D64EC]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#1D64EC] font-bold">
            STUDENT TOOLCHAIN &amp; IDES
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Developer Tools Manager
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Curate essential software tools for student developers. Click auto-fetch favicon to get logos automatically.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="btn-primary text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Tool</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden relative">
                  {tool.logo ? (
                    <Image
                      src={tool.logo}
                      alt={tool.name}
                      width={28}
                      height={28}
                      className="object-contain"
                      onError={(e) => {
                        (e.target as any).src = "https://icons.duckduckgo.com/ip3/github.com.ico";
                      }}
                    />
                  ) : (
                    <Wrench className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
                  {tool.tag || "Utility"}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">
                {tool.name}
              </h3>

              <p className="text-xs font-semibold text-slate-700 mb-2">
                {tool.oneLiner}
              </p>

              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                {tool.description}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1D64EC] font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Visit Tool</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {tool.youtubeUrl && (
                  <a
                    href={tool.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-rose-600 font-semibold flex items-center gap-1 hover:underline"
                    title="YouTube tutorial"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsNew(false);
                    setEditingTool(tool);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(tool.id)}
                  className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingTool && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {isNew ? "Add Developer Tool" : "Edit Tool"}
              </h3>
              <button
                onClick={() => setEditingTool(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tool Name
                </label>
                <input
                  type="text"
                  required
                  value={editingTool.name}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                  placeholder="e.g. Visual Studio Code"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tool URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editingTool.url}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, url: e.target.value })
                    }
                    className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={handleAutoFavicon}
                    className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200"
                  >
                    Auto Favicon
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tag / Category
                  </label>
                  <input
                    type="text"
                    value={editingTool.tag || ""}
                    onChange={(e) =>
                      setEditingTool({ ...editingTool, tag: e.target.value })
                    }
                    placeholder="e.g. Code Editor, DevOps, Database"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Display on Home
                  </label>
                  <select
                    value={editingTool.showOnHome ? "yes" : "no"}
                    onChange={(e) =>
                      setEditingTool({
                        ...editingTool,
                        showOnHome: e.target.value === "yes",
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-[#1D64EC]"
                  >
                    <option value="yes">Yes (Show on Home)</option>
                    <option value="no">No (Tools page only)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  One-liner Summary
                </label>
                <input
                  type="text"
                  value={editingTool.oneLiner || ""}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, oneLiner: e.target.value })
                  }
                  placeholder="e.g. The industry-standard code editor"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Description
                </label>
                <textarea
                  rows={2}
                  value={editingTool.description || ""}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-rose-600" />
                  YouTube Tutorial / Playlist URL
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="url"
                  value={editingTool.youtubeUrl || ""}
                  onChange={(e) =>
                    setEditingTool({ ...editingTool, youtubeUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/playlist?list=... or https://youtu.be/..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  When set, a YouTube icon appears next to "Visit Tool" so users can learn how to use this tool.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTool(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs font-semibold py-2 px-5 rounded-lg flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isNew ? "Create Tool" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
