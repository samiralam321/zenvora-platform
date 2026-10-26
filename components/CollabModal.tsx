"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Loader2, Send } from "lucide-react";
import Link from "next/link";

interface CollabModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export default function CollabModal({
  isOpen,
  onClose,
}: CollabModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [budget, setBudget] = useState("$2,000 - $5,000");
  const [service, setService] = useState("Student Community Partnership");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(true);
  const [honeypot, setHoneypot] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (honeypot) return;

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please provide your name, email, and project message.");
      return;
    }

    if (!consent) {
      setError("Please check the consent box to proceed.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          budget,
          service,
          message: message.trim(),
          consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry.");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Message Sent Successfully!
            </h3>
            <p className="text-slate-500 text-sm max-w-sm">
              Thanks for reaching out! The Zenvora team will review your enquiry and get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <span className="text-[11px] uppercase tracking-wider text-[#1D64EC] font-bold">
                PARTNER WITH ZENVORA
              </span>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
                Collaborations & Sponsorships
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Tell us about your brand, campaign goals, or integration ideas.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="favorite_color"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company / Brand Name
                  </label>
                  <input
                    type="text"
                    placeholder="Acme Brands"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Service Interested In
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                  >
                    <option value="Student Community Partnership">Student Community Partnership</option>
                    <option value="YouTube Sponsorship">YouTube Video Sponsorship</option>
                    <option value="Consulting & Strategy">1-on-1 Strategy Consulting</option>
                    <option value="Other Project">Other Collaboration</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Ad Budget / Scope
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                  >
                    <option value="< ₹1,00,000">&lt; ₹1,00,000 ($1.2k)</option>
                    <option value="₹1,00,000 - ₹5,00,000">₹1L - ₹5L ($1.2k - $6k)</option>
                    <option value="₹5,00,000 - ₹15,00,000">₹5L - ₹15L ($6k - $18k)</option>
                    <option value="₹15,00,000+">₹15L+ ($18k+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Details / Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us about your brand, current monthly ad spend, and target goals..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC] resize-none"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="collab-consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1D64EC] focus:ring-[#1D64EC]"
                />
                <label htmlFor="collab-consent" className="text-xs text-slate-500 leading-tight">
                  I agree that Zenvora may contact me regarding this enquiry according to the{" "}
                  <Link href="/privacy-policy" target="_blank" className="text-[#1D64EC] underline">
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 text-sm font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Send Collaboration Enquiry</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
