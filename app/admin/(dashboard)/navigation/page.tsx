"use client";

import React, { useState, useEffect } from "react";
import {
  Navigation,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function AdminNavigationPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // New item form
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isBtn, setIsBtn] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/navigation");
      const data = await res.json();
      if (data.items) setItems(data.items);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const moveItem = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const copy = [...items];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reordered = copy.map((it, i) => ({ ...it, order: i + 1 }));
    setItems(reordered);
  };

  const handleToggleVisible = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, visible: !it.visible } : it))
    );
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel || !newUrl) return;

    try {
      const res = await fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel, url: newUrl, isButton: isBtn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNewLabel("");
      setNewUrl("");
      setIsBtn(false);
      setMessage("Navigation link added!");
      fetchItems();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/navigation", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage("Navigation saved and updated on live site!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this navigation item?")) return;
    try {
      await fetch(`/api/admin/navigation?id=${id}`, { method: "DELETE" });
      setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {}
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center text-gold">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold/15">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Header & Footer Menus
          </span>
          <h1 className="font-serif text-3xl font-bold text-ivory tracking-tight mt-1">
            Navigation Builder
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Add, reorder, rename, and show/hide links and CTA buttons.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="gold-btn text-xs uppercase tracking-wider font-semibold py-2.5 px-6 shadow-gold-glow/30"
        >
          {saving ? "Saving..." : "Save Navigation"}
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Add New Nav Item Card */}
      <div className="luxury-card p-6">
        <h3 className="font-serif text-lg font-bold text-ivory mb-4">
          Add Navigation Link / Button
        </h3>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <label className="block text-[11px] text-muted mb-1">Label</label>
            <input
              type="text"
              required
              placeholder="e.g. Community"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink/80 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] text-muted mb-1">Destination URL</label>
            <input
              type="text"
              required
              placeholder="/resources or https://..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-ink/80 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold font-mono"
            />
          </div>

          <div className="sm:col-span-3 flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={isBtn}
                onChange={(e) => setIsBtn(e.target.checked)}
                className="w-4 h-4 rounded border-gold/40 text-gold focus:ring-gold bg-ink"
              />
              <span>Pill Button</span>
            </label>

            <button
              type="submit"
              className="gold-btn text-xs uppercase tracking-wider font-semibold py-2 px-4 shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-ink" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reorderable Items List */}
      <div className="luxury-card overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-xs uppercase font-semibold text-gold">
            Navigation Order
          </span>
          <span className="text-xs text-muted">Drag or use arrow buttons to arrange order</span>
        </div>

        <div className="divide-y divide-white/5">
          {items.map((it, idx) => (
            <div
              key={it.id}
              className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                !it.visible ? "opacity-40" : ""
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xs font-mono text-muted w-6">#{it.order}</span>
                <input
                  type="text"
                  value={it.label}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItems((prev) =>
                      prev.map((item) => (item.id === it.id ? { ...item, label: val } : item))
                    );
                  }}
                  className="px-2.5 py-1 rounded bg-ink/70 border border-gold/20 text-ivory text-xs font-semibold focus:outline-none focus:border-gold w-36"
                />

                <input
                  type="text"
                  value={it.url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setItems((prev) =>
                      prev.map((item) => (item.id === it.id ? { ...item, url: val } : item))
                    );
                  }}
                  className="px-2.5 py-1 rounded bg-ink/70 border border-gold/20 text-muted text-xs font-mono focus:outline-none focus:border-gold flex-1"
                />

                {it.isButton && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gold/10 text-gold border border-gold/25">
                    CTA Button
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => moveItem(idx, "up")}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg border border-gold/15 text-ivory hover:text-gold disabled:opacity-20"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => moveItem(idx, "down")}
                  disabled={idx === items.length - 1}
                  className="p-1.5 rounded-lg border border-gold/15 text-ivory hover:text-gold disabled:opacity-20"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleToggleVisible(it.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    it.visible ? "border-gold/25 text-gold" : "border-white/10 text-muted"
                  }`}
                >
                  {it.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleDelete(it.id)}
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
