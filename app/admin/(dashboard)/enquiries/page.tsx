"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Mail,
  Trash2,
  Loader2,
  Building,
  DollarSign,
  Phone,
  Calendar,
} from "lucide-react";

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch("/api/admin/enquiries");
      const data = await res.json();
      if (data.enquiries) setEnquiries(data.enquiries);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch("/api/admin/enquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;
    try {
      await fetch(`/api/admin/enquiries?id=${id}`, { method: "DELETE" });
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
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
      <div className="pb-6 border-b border-gold/15">
        <span className="text-xs uppercase tracking-widest text-gold font-semibold">
          High-Ticket Partnerships & Sponsorships
        </span>
        <h1 className="font-serif text-3xl font-bold text-ivory tracking-tight mt-1">
          Collaborations & Enquiries
        </h1>
        <p className="text-muted text-xs sm:text-sm mt-0.5">
          Messages received from brands, founders, and media buying teams.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="luxury-card p-12 text-center text-muted text-xs">
          No collaboration enquiries submitted yet.
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq.id} className="luxury-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-serif text-xl font-bold text-ivory flex items-center gap-2">
                    <span>{enq.name}</span>
                    {enq.company && (
                      <span className="text-xs text-muted font-normal flex items-center gap-1 font-sans">
                        <Building className="w-3.5 h-3.5 text-gold" />
                        <span>{enq.company}</span>
                      </span>
                    )}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted">
                    <span className="text-gold font-mono">{enq.email}</span>
                    {enq.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-gold" />
                        <span>{enq.phone}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(enq.createdAt).toLocaleString()}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={enq.status}
                    onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-ink border border-gold/20 text-xs font-semibold text-ivory focus:outline-none focus:border-gold"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <a
                    href={`mailto:${enq.email}?subject=Regarding your enquiry with Zenvora`}
                    className="secondary-pill text-xs font-semibold py-1.5 px-3"
                  >
                    <Mail className="w-3 h-3 text-gold" />
                    <span>Reply</span>
                  </a>

                  <button
                    onClick={() => handleDelete(enq.id)}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Scope & Budget badges */}
              <div className="flex flex-wrap gap-2 text-xs">
                {enq.service && (
                  <span className="px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/25 font-medium">
                    Service: {enq.service}
                  </span>
                )}
                {enq.budget && (
                  <span className="px-3 py-1 rounded-full bg-white/5 text-ivory/80 border border-white/10 font-medium flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-emerald-400" />
                    <span>Budget: {enq.budget}</span>
                  </span>
                )}
              </div>

              {/* Message */}
              <div className="p-4 rounded-xl bg-ink/70 border border-gold/15 text-xs sm:text-sm text-stone leading-relaxed whitespace-pre-wrap">
                {enq.message}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
