"use client";

import React, { useState } from "react";
import { X, Sparkles, CheckCircle2, Loader2, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function UnlockModal({
  isOpen,
  onClose,
  onSuccess,
}: UnlockModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("Data Structures & Algorithms (DSA)");
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

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill in your name, email, and WhatsApp number.");
      return;
    }

    if (!consent) {
      setError("Please agree to receive educational updates to continue.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          interest,
          consent,
          source: "unlock_modal",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit. Please try again.");
      }

      // Set cookie for 12 months (365 days)
      const maxAge = 365 * 24 * 60 * 60;
      document.cookie = `resources_unlocked=1; path=/; max-age=${maxAge}; SameSite=Lax`;

      setIsSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Resources Unlocked!
            </h3>
            <p className="text-slate-500 text-sm max-w-sm">
              All copy-paste prompts, spreadsheets, and video blueprints are now accessible.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-[#EEF4FF] text-[#1D64EC] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <span className="text-[11px] uppercase tracking-wider text-[#1D64EC] font-bold">
                Free Immediate Access
              </span>
            </div>

            <h3 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Unlock All Prompts & Roadmaps
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
              Enter your details below to instantly unlock our full library of developer roadmaps, DSA cheat sheets, and project resources. No passwords, no login walls.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bot Honeypot (hidden) */}
              <input
                type="text"
                name="user_nickname"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp / Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What do you want to learn most?
                </label>
                <select
                  value={interest}
                  onChange={(e) => setInterest(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-[#1D64EC]"
                >
                  <option value="Data Structures & Algorithms (DSA)">Data Structures & Algorithms (DSA)</option>
                  <option value="Full Stack & Web Development">Full Stack & Web Development</option>
                  <option value="Backend Engineering & APIs">Backend Engineering & APIs</option>
                  <option value="System Design & Architecture">System Design & Architecture</option>
                  <option value="AI & Machine Learning">AI & Machine Learning / GenAI</option>
                  <option value="Competitive Programming">Competitive Programming</option>
                </select>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1D64EC] focus:ring-[#1D64EC]"
                />
                <label htmlFor="consent" className="text-xs text-slate-500 leading-tight">
                  I agree to receive free educational updates and tutorial drops. I understand I can unsubscribe at any time. View our{" "}
                  <Link href="/privacy-policy" target="_blank" className="text-[#1D64EC] underline">
                    Privacy Policy
                  </Link>.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-3 text-sm font-semibold shadow-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white mr-2" />
                    <span>Unlocking...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span>Unlock Everything Now</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
