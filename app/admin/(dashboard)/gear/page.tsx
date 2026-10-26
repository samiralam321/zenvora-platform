"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Camera,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function AdminGearPage() {
  const [gear, setGear] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGear, setEditingGear] = useState<any | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchGear = async () => {
    try {
      const res = await fetch("/api/admin/gear");
      const data = await res.json();
      if (data.gear) setGear(data.gear);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGear();
  }, []);

  const handleCreateNew = () => {
    setIsNew(true);
    setEditingGear({
      name: "",
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
      description: "",
      price: "",
      url: "",
      category: "Audio",
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGear?.name || !editingGear?.url) return;

    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const res = await fetch("/api/admin/gear", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingGear),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage(isNew ? "Gear item added!" : "Gear updated!");
      setEditingGear(null);
      setIsNew(false);
      fetchGear();
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gear item?")) return;
    try {
      await fetch(`/api/admin/gear?id=${id}`, { method: "DELETE" });
      setGear((prev) => prev.filter((g) => g.id !== id));
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
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold/15">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Hardware & Recording Equipment
          </span>
          <h1 className="font-serif text-3xl font-bold text-ivory tracking-tight mt-1">
            My Gear Manager
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Manage your hardware recommendations, cameras, microphones, and workstation specs.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="gold-btn text-xs uppercase tracking-wider font-semibold py-2.5 px-4"
        >
          <Plus className="w-3.5 h-3.5 text-ink" />
          <span>Add Gear Item</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Gear Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {gear.map((item) => (
          <div key={item.id} className="luxury-card overflow-hidden flex flex-col justify-between">
            <div>
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-ink/80 text-gold border border-gold/30">
                    {item.category}
                  </span>
                </div>
                {item.price && (
                  <div className="absolute bottom-2 right-2 bg-ink/90 border border-gold/20 text-gold text-xs px-2 py-0.5 rounded font-mono">
                    {item.price}
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-serif text-base font-bold text-ivory line-clamp-1 mb-1">
                  {item.name}
                </h3>
                <p className="text-muted text-xs line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold hover:underline flex items-center gap-1 font-mono"
              >
                <span>Store Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsNew(false);
                    setEditingGear(item);
                  }}
                  className="p-1.5 rounded-lg border border-gold/20 text-gold hover:bg-gold/10"
                  title="Edit"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editingGear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-2xl bg-ink-card border border-gold/30 p-6 shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-ivory mb-4">
              {isNew ? "Add Hardware Item" : "Edit Gear Item"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ivory/80 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editingGear.name}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, name: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-ink/80 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ivory/80 mb-1">Category</label>
                  <select
                    value={editingGear.category}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-ink/80 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                  >
                    <option value="Audio">Audio / Microphone</option>
                    <option value="Camera">Camera & Lens</option>
                    <option value="Workstation">Workstation & Computer</option>
                    <option value="Lighting">Lighting & Studio</option>
                    <option value="Accessories">Accessories & Desks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-ivory/80 mb-1">Approx Price</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹34,999 or $399"
                    value={editingGear.price || ""}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, price: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-ink/80 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-ivory/80 mb-1">Affiliate Store URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://amazon.in/..."
                    value={editingGear.url}
                    onChange={(e) =>
                      setEditingGear({ ...editingGear, url: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-ink/80 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-ivory/80 mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingGear.image}
                  onChange={(e) =>
                    setEditingGear({ ...editingGear, image: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-ink/80 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-ivory/80 mb-1">Why I Use It (Description)</label>
                <textarea
                  rows={3}
                  value={editingGear.description}
                  onChange={(e) =>
                    setEditingGear({ ...editingGear, description: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-ink/80 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingGear(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-muted hover:text-ivory text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="gold-btn text-xs uppercase tracking-wider font-semibold py-2 px-6"
                >
                  {saving ? "Saving..." : "Save Gear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
