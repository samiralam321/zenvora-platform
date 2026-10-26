"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Download,
  Copy,
  Check,
  Trash2,
  MessageCircle,
  Mail,
  Loader2,
  CheckCircle2,
  Filter,
} from "lucide-react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      const q = new URLSearchParams();
      if (search) q.set("search", search);
      if (statusFilter !== "all") q.set("status", statusFilter);

      const res = await fetch(`/api/admin/leads?${q.toString()}`);
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [search, statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/admin/leads", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this lead record?")) return;
    try {
      await fetch(`/api/admin/leads?id=${id}`, { method: "DELETE" });
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setMessage("Lead record deleted.");
      setTimeout(() => setMessage(null), 3000);
    } catch (e) {}
  };

  const handleCopyAllEmails = () => {
    const emails = leads.map((l) => l.email).filter(Boolean).join(", ");
    navigator.clipboard.writeText(emails);
    setCopiedEmails(true);
    setTimeout(() => setCopiedEmails(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold/15">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Contact & Subscriber Intelligence
          </span>
          <h1 className="font-serif text-3xl font-bold text-ivory tracking-tight mt-1">
            Leads Database
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Visitors who unlocked the Free Prompts vault. Fully exportable and actionable.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyAllEmails}
            className="secondary-pill text-xs uppercase tracking-wider font-semibold py-2.5 px-4"
          >
            {copiedEmails ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Emails Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-gold" />
                <span>Copy All Emails</span>
              </>
            )}
          </button>

          <a
            href="/api/admin/leads/export"
            className="gold-btn text-xs uppercase tracking-wider font-semibold py-2.5 px-4"
          >
            <Download className="w-3.5 h-3.5 text-ink" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-ink-card border border-gold/20 text-ivory text-xs placeholder:text-muted/60 focus:outline-none focus:border-gold"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-muted" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-full bg-ink-card border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold"
          >
            <option value="all">All Statuses ({leads.length})</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
            <option value="Not interested">Not interested</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="luxury-card overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center text-gold">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-muted text-xs">
            No leads found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 border-b border-white/5 text-muted uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">WhatsApp / Phone</th>
                  <th className="p-3.5">Interest</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Captured</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-ivory/90">
                {leads.map((l) => {
                  const cleanPhone = l.phone.replace(/[^0-9]/g, "");

                  return (
                    <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-medium text-ivory">{l.name}</td>
                      <td className="p-3.5 font-mono text-muted">{l.email}</td>
                      <td className="p-3.5 font-mono text-gold">{l.phone}</td>
                      <td className="p-3.5 text-muted">{l.interest || "General"}</td>
                      <td className="p-3.5">
                        <select
                          value={l.status}
                          onChange={(e) => handleStatusChange(l.id, e.target.value)}
                          className="px-2 py-1 rounded bg-ink border border-gold/20 text-xs font-semibold focus:outline-none focus:border-gold"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                          <option value="Not interested">Not interested</option>
                        </select>
                      </td>
                      <td className="p-3.5 text-muted">
                        {new Date(l.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Chat on WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <a
                            href={`mailto:${l.email}`}
                            className="p-1.5 rounded-lg border border-gold/20 text-gold hover:bg-gold/10 transition-colors"
                            title="Send Email"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleDelete(l.id)}
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
