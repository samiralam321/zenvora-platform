"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle2, Sparkles, Globe, Share2, Shield, Sliders } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load settings");
        setLoading(false);
      });
  }, []);

  const handleChange = (key: string, val: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setError(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gold/15">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">
            Global Site Configuration
          </span>
          <h1 className="font-serif text-3xl font-bold text-ivory tracking-tight mt-1">
            Site Settings
          </h1>
          <p className="text-muted text-xs sm:text-sm mt-0.5">
            Manage your brand details, social links, SEO tags, unlock preferences, and disclosure text.
          </p>
        </div>

        <button
          onClick={handleSave}
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
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved and public pages revalidated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Card 1: Brand & Identity */}
        <div className="luxury-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <Globe className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-xl font-bold text-ivory">Brand & Creator Identity</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">Brand Name</label>
              <input
                type="text"
                value={settings.brandName || ""}
                onChange={(e) => handleChange("brandName", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">Creator Name</label>
              <input
                type="text"
                value={settings.creatorName || ""}
                onChange={(e) => handleChange("creatorName", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">Agency Name</label>
              <input
                type="text"
                value={settings.agencyName || ""}
                onChange={(e) => handleChange("agencyName", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">Site Tagline</label>
              <input
                type="text"
                value={settings.tagline || ""}
                onChange={(e) => handleChange("tagline", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">Avatar Image URL</label>
              <input
                type="text"
                value={settings.avatarUrl || ""}
                onChange={(e) => handleChange("avatarUrl", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">Default OpenGraph Image URL</label>
              <input
                type="text"
                value={settings.ogImageUrl || ""}
                onChange={(e) => handleChange("ogImageUrl", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Social Media & Contacts */}
        <div className="luxury-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <Share2 className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-xl font-bold text-ivory">Social Links & Contact Channels</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">YouTube Channel URL</label>
              <input
                type="text"
                value={settings.youtubeUrl || ""}
                onChange={(e) => handleChange("youtubeUrl", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">YouTube Channel ID</label>
              <input
                type="text"
                value={settings.youtubeChannelId || ""}
                onChange={(e) => handleChange("youtubeChannelId", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">Instagram URL</label>
              <input
                type="text"
                value={settings.instagramUrl || ""}
                onChange={(e) => handleChange("instagramUrl", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">Telegram Community URL</label>
              <input
                type="text"
                value={settings.telegramUrl || ""}
                onChange={(e) => handleChange("telegramUrl", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">WhatsApp / Phone Number</label>
              <input
                type="text"
                value={settings.whatsappNumber || ""}
                onChange={(e) => handleChange("whatsappNumber", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">Business Email</label>
              <input
                type="email"
                value={settings.businessEmail || ""}
                onChange={(e) => handleChange("businessEmail", e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Resources Vault & Functional Toggles */}
        <div className="luxury-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <Sliders className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-xl font-bold text-ivory">Feature Switches & Unlock Policy</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">
                Resources Vault Access Mode
              </label>
              <select
                value={settings.unlockMode || "required"}
                onChange={(e) => handleChange("unlockMode", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-sm focus:outline-none focus:border-gold"
              >
                <option value="required">(a) Form Required - visitor must fill form once (12-mo cookie)</option>
                <option value="optional">(b) Form Optional - visitor can skip form to view</option>
                <option value="public">(c) Fully Public - no form displayed at all</option>
              </select>
            </div>

            <div className="flex flex-col justify-center space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.scrollToTopEnabled !== false}
                  onChange={(e) => handleChange("scrollToTopEnabled", e.target.checked)}
                  className="w-4 h-4 rounded border-gold/40 text-gold focus:ring-gold bg-ink"
                />
                <span className="text-xs text-ivory">Enable floating "Scroll to top" button</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shortsEnabled !== false}
                  onChange={(e) => handleChange("shortsEnabled", e.target.checked)}
                  className="w-4 h-4 rounded border-gold/40 text-gold focus:ring-gold bg-ink"
                />
                <span className="text-xs text-ivory">Show YouTube Shorts in /watch-tutorials</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.watchModalEnabled === true}
                  onChange={(e) => handleChange("watchModalEnabled", e.target.checked)}
                  className="w-4 h-4 rounded border-gold/40 text-gold focus:ring-gold bg-ink"
                />
                <span className="text-xs text-ivory">Enable "Watch here" modal (youtube-nocookie)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 4: Disclosures & Legal */}
        <div className="luxury-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
            <Shield className="w-5 h-5 text-gold" />
            <h3 className="font-serif text-xl font-bold text-ivory">Affiliate Disclosure & Legal Footer</h3>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.affiliateDisclosureEnabled !== false}
                onChange={(e) => handleChange("affiliateDisclosureEnabled", e.target.checked)}
                className="w-4 h-4 rounded border-gold/40 text-gold focus:ring-gold bg-ink"
              />
              <span className="text-xs text-ivory font-medium">Display affiliate disclosure in footer</span>
            </label>

            <div>
              <label className="block text-xs font-medium text-ivory/80 mb-1.5">
                Affiliate Disclosure Text
              </label>
              <textarea
                rows={3}
                value={settings.affiliateDisclosureText || ""}
                onChange={(e) => handleChange("affiliateDisclosureText", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-ink/70 border border-gold/20 text-ivory text-xs focus:outline-none focus:border-gold resize-none"
              />
            </div>
          </div>
        </div>

        {/* Floating Bottom Save Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="gold-btn text-xs uppercase tracking-wider font-semibold py-3 px-8 shadow-gold-glow"
          >
            {saving ? "Saving Changes..." : "Save All Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
