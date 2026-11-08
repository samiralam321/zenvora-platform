"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SupportModal from "@/components/SupportModal";

interface FooterProps {
  settings?: {
    brandName?: string;
    avatarUrl?: string;
    tagline?: string;
    affiliateDisclosureEnabled?: boolean;
    affiliateDisclosureText?: string;
    youtubeUrl?: string;
    githubUrl?: string;
    discordUrl?: string;
    buyMeACoffeeUrl?: string;
    upiId?: string;
    creatorName?: string;
  };
}

export default function Footer({ settings = {} }: FooterProps) {
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const brandName = settings.brandName || "Zenvora";
  const avatarUrl = settings.avatarUrl || "/images/zenvora-logo.png";
  const tagline =
    settings.tagline ||
    "Curated roadmaps, step-by-step lectures, and practical project resources for Web Dev, Backend, Full Stack, AI/ML & GenAI.";
  const affiliateEnabled = settings.affiliateDisclosureEnabled === true;
  const affiliateText =
    settings.affiliateDisclosureText ||
    "Some links on this site may be resource partnerships. We only recommend tools battle-tested by modern engineers.";

  return (
    <>
      <footer className="bg-white border-t border-slate-100 pt-16 pb-12 text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top columns row */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12">
            {/* Brand Info (2 cols on md) */}
            <div className="md:col-span-2 flex flex-col gap-3">
              <Link
                href="/"
                className="flex items-center transition-opacity hover:opacity-90"
                aria-label="Zenvora Homepage"
              >
                <Image
                  src={avatarUrl || "/images/zenvora-logo.png"}
                  alt={brandName || "Zenvora"}
                  width={120}
                  height={34}
                  className="h-8 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-500 text-xs sm:text-sm max-w-sm leading-relaxed">
                {tagline}
              </p>
              <div className="text-xs text-slate-400 mt-2">
                Built for students &amp; self-taught developers.
              </div>

              {/* Buy Me a Coffee button matching mockup */}
              <div className="mt-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSupportOpen(true)}
                  className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-slate-950 font-bold shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 border border-amber-300/60"
                  aria-label="Buy me a coffee and support Zenvora"
                >
                  <svg
                    className="w-5 h-5 text-slate-950"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                    <line x1="6" y1="2" x2="6" y2="4" />
                    <line x1="10" y1="2" x2="10" y2="4" />
                    <line x1="14" y1="2" x2="14" y2="4" />
                  </svg>
                  <span className="font-['Cookie',_cursive] text-2xl font-normal leading-none tracking-wide text-slate-950 pt-0.5">
                    Buy me a coffee
                  </span>
                </button>
              </div>
            </div>

            {/* Domains Column */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-sm font-semibold text-slate-900">
                Tech Domains
              </h4>
              <ul className="flex flex-col gap-2 text-xs text-slate-500">
                <li>
                  <Link href="/watch-tutorials?category=web-dev" className="hover:text-slate-900 transition-colors">
                    Web Dev
                  </Link>
                </li>
                <li>
                  <Link href="/watch-tutorials?category=backend-dev" className="hover:text-slate-900 transition-colors">
                    Backend Dev
                  </Link>
                </li>
                <li>
                  <Link href="/watch-tutorials?category=full-stack" className="hover:text-slate-900 transition-colors">
                    Full Stack
                  </Link>
                </li>
                <li>
                  <Link href="/watch-tutorials?category=ai-ml" className="hover:text-slate-900 transition-colors">
                    AI &amp; Machine Learning
                  </Link>
                </li>
                <li>
                  <Link href="/watch-tutorials?category=gen-ai" className="hover:text-slate-900 transition-colors">
                    Generative AI
                  </Link>
                </li>
                <li>
                  <Link href="/competitive-programming" className="hover:text-slate-900 transition-colors">
                    Competitive Programming
                  </Link>
                </li>
              </ul>
            </div>

            {/* Curriculum & Tools Column */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-sm font-semibold text-slate-900">
                Platform
              </h4>
              <ul className="flex flex-col gap-2 text-xs text-slate-500">
                <li>
                  <Link href="/watch-tutorials" className="hover:text-slate-900 transition-colors">
                    All Lectures
                  </Link>
                </li>
                <li>
                  <Link href="/recommended-tools" className="hover:text-slate-900 transition-colors">
                    Developer Tools
                  </Link>
                </li>
                <li>
                  <Link href="/opportunities" className="hover:text-slate-900 transition-colors">
                    Opportunities
                  </Link>
                </li>
              </ul>
            </div>

            {/* Community Column */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-sm font-semibold text-slate-900">
                Community
              </h4>
              <ul className="flex flex-col gap-2 text-xs text-slate-500">
                <li>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 transition-colors"
                  >
                    GitHub Repos
                  </a>
                </li>
                <li>
                  <a
                    href="https://discord.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 transition-colors"
                  >
                    Student Discord
                  </a>
                </li>
                <li>
                  <Link href="/resources" className="hover:text-slate-900 transition-colors">
                    Suggest a Roadmap
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Affiliate / Community Disclosure */}
          {affiliateEnabled && (
            <div className="pt-6 border-t border-slate-100 text-xs text-slate-400 leading-relaxed max-w-4xl">
              {affiliateText}
            </div>
          )}

          {/* Bottom Legal bar */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="hover:text-slate-600 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-and-conditions" className="hover:text-slate-600 transition-colors">
                Terms &amp; Conditions
              </Link>
              <Link href="/disclaimer" className="hover:text-slate-600 transition-colors">
                Disclaimer
              </Link>
            </div>

            <div>
              &copy; {brandName} {currentYear} &bull; Built for Students &amp; Builders
            </div>
          </div>
        </div>
      </footer>

      {/* Support & Payment Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        buyMeACoffeeUrl={settings.buyMeACoffeeUrl || "https://buymeacoffee.com/samiralam"}
        upiId={settings.upiId || "sa8103339@okaxis"}
        creatorName={settings.creatorName || "Samir Alam"}
      />
    </>
  );
}
