"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Video,
  Copy,
  Lock,
  Unlock,
  Loader2,
  CheckCircle2,
  X,
  FileCode,
} from "lucide-react";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingResource, setEditingResource] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/admin/resources");
      const data = await res.json();
      if (data.resources) setResources(data.resources);
      if (data.categories) setCategories(data.categories);
      if (data.videos) setVideos(data.videos);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingResource({
      title: "",
      description: "",
      categoryId: categories[0]?.id || "",
      videoId: "",
      promptText: "",
      fileUrl: "",
      locked: false,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource?.title) return;

    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/resources", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingResource),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(isNew ? "Student resource created!" : "Student resource updated!");
      setEditingResource(null);
      setIsNew(false);
      fetchResources();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    try {
      await fetch(`/api/admin/resources?id=${id}`, { method: "DELETE" });
      setResources((prev) => prev.filter((r) => r.id !== id));
      setMessage("Resource deleted");
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
            STUDENT REPOSITORY &amp; NOTES
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Student Resources Vault
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Curate cheat sheets, code boilerplates, system design checklists, and roadmaps for learners.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="btn-primary text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Resource</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
                  {item.category?.name || "General"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.locked
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {item.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span>{item.locked ? "Sign-up Required" : "Public Access"}</span>
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {item.title}
              </h3>

              <p className="text-slate-600 text-xs leading-relaxed line-clamp-2 mb-4">
                {item.description}
              </p>

              {item.promptText && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-700 line-clamp-3 mb-4">
                  {item.promptText}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
                {item.fileUrl ? "External URL linked" : "No link"}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsNew(false);
                    setEditingResource(item);
                  }}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
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
      {editingResource && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {isNew ? "Create Student Resource" : "Edit Resource"}
              </h3>
              <button
                onClick={() => setEditingResource(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={editingResource.title}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                  placeholder="e.g. Next.js 14 Full Stack Architecture Blueprint"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingResource.description}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Domain
                  </label>
                  <select
                    value={editingResource.categoryId || ""}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, categoryId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-[#1D64EC]"
                  >
                    <option value="">Unassigned</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Access Gate
                  </label>
                  <select
                    value={editingResource.locked ? "locked" : "public"}
                    onChange={(e) =>
                      setEditingResource({
                        ...editingResource,
                        locked: e.target.value === "locked",
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs bg-white focus:outline-none focus:border-[#1D64EC]"
                  >
                    <option value="public">Public (1-Click Instant Access)</option>
                    <option value="locked">Gated (Requires Student Signup)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Snippet / Code / Prompt Content
                </label>
                <textarea
                  rows={4}
                  value={editingResource.promptText || ""}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, promptText: e.target.value })
                  }
                  placeholder="Code snippet, prompt text, or cheat sheet notes..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono text-xs focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  External Roadmap / Documentation URL
                </label>
                <input
                  type="text"
                  value={editingResource.fileUrl || ""}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, fileUrl: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingResource(null)}
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
                  <span>{isNew ? "Create Resource" : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
