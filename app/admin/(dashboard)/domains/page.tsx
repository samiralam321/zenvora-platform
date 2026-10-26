"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Code2,
  Server,
  Cpu,
  Sparkles,
  Globe,
  Database,
  Smartphone,
  Cloud,
  CheckCircle2,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";

interface DomainItem {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  order: number;
  _count?: {
    videos: number;
    resources: number;
  };
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: "",
    name: "",
    slug: "",
    icon: "Code2",
    description: "",
    order: 0,
  });

  const fetchDomains = async () => {
    try {
      const res = await fetch("/api/admin/domains");
      const data = await res.json();
      if (data.domains) setDomains(data.domains);
      setLoading(false);
    } catch (e) {
      setError("Failed to fetch domains");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const openCreateModal = () => {
    setIsEditing(false);
    setForm({
      id: "",
      name: "",
      slug: "",
      icon: "Code2",
      description: "",
      order: domains.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (d: DomainItem) => {
    setIsEditing(true);
    setForm({
      id: d.id,
      name: d.name,
      slug: d.slug,
      icon: d.icon || "Sparkles",
      description: d.description || "",
      order: d.order,
    });
    setModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    if (!isEditing) {
      const generatedSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-");
      setForm((prev) => ({ ...prev, name, slug: generatedSlug }));
    } else {
      setForm((prev) => ({ ...prev, name }));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch("/api/admin/domains", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save domain");

      setMessage(isEditing ? "Domain updated successfully!" : "New domain added successfully!");
      setModalOpen(false);
      fetchDomains();
      setTimeout(() => setMessage(null), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to save domain");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Any linked lectures or resources will remain unassigned.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/domains?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      setMessage(`Domain "${name}" removed`);
      fetchDomains();
      setTimeout(() => setMessage(null), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to delete");
    }
  };

  const renderIcon = (iconName: string | null) => {
    const ic = (iconName || "").toLowerCase();
    if (ic.includes("code") || ic.includes("web")) return <Code2 className="w-5 h-5 text-[#1D64EC]" />;
    if (ic.includes("server") || ic.includes("backend")) return <Server className="w-5 h-5 text-[#1D64EC]" />;
    if (ic.includes("layer") || ic.includes("full")) return <Layers className="w-5 h-5 text-[#1D64EC]" />;
    if (ic.includes("cpu") || ic.includes("ml") || ic.includes("ai")) return <Cpu className="w-5 h-5 text-[#1D64EC]" />;
    if (ic.includes("sparkle") || ic.includes("gen")) return <Sparkles className="w-5 h-5 text-[#1D64EC]" />;
    if (ic.includes("data")) return <Database className="w-5 h-5 text-[#1D64EC]" />;
    if (ic.includes("phone") || ic.includes("mobile")) return <Smartphone className="w-5 h-5 text-[#1D64EC]" />;
    if (ic.includes("cloud")) return <Cloud className="w-5 h-5 text-[#1D64EC]" />;
    return <Globe className="w-5 h-5 text-[#1D64EC]" />;
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center text-[#1D64EC]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-6xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-[#1D64EC] font-bold">
            ACADEMIC TRACKS &amp; CURRICULUM
          </span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mt-1">
            Domains &amp; Tech Stacks
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Organize the platform into clear tech domains so students never get lost. Add and customize tech roadmaps.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary text-xs font-semibold py-2.5 px-4 rounded-lg shadow-sm flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Domain</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Domains Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((d) => (
          <div
            key={d.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#EEF4FF] flex items-center justify-center">
                  {renderIcon(d.icon)}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                    Order #{d.order}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {d.name}
              </h3>
              <p className="text-xs font-mono text-slate-400 mb-3">
                /{d.slug}
              </p>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {d.description || "No description provided."}
              </p>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-auto">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>{d._count?.videos || 0} Lectures</span>
                <span>&bull;</span>
                <span>{d._count?.resources || 0} Student Resources</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <a
                  href={`/watch-tutorials?category=${d.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1D64EC] font-semibold flex items-center gap-1 hover:underline"
                >
                  <span>Preview Track</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(d)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                    title="Edit Domain"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(d.id, d.name)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Domain"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Learning Domain" : "Add New Tech Domain"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Domain Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Web Dev, DevOps, Mobile Dev"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-[#1D64EC] focus:ring-1 focus:ring-[#1D64EC] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. web-dev"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm font-mono focus:border-[#1D64EC] focus:ring-1 focus:ring-[#1D64EC] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Icon Type
                  </label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-[#1D64EC] outline-none bg-white"
                  >
                    <option value="Code2">Code2 (Web Dev / Coding)</option>
                    <option value="Server">Server (Backend / APIs)</option>
                    <option value="Layers">Layers (Full Stack)</option>
                    <option value="Cpu">Cpu (AI / ML / Data)</option>
                    <option value="Sparkles">Sparkles (GenAI / LLMs)</option>
                    <option value="Database">Database (SQL / Storage)</option>
                    <option value="Smartphone">Smartphone (Mobile)</option>
                    <option value="Cloud">Cloud (DevOps / Infra)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-[#1D64EC] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Topics Covered
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of technologies, roadmaps, and key concepts in this domain..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:border-[#1D64EC] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEditing ? "Save Changes" : "Create Domain"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
