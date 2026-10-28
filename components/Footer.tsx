"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

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
  };
}

export default function Footer({ settings = {} }: FooterProps) {
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
              <li>
               
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
  );
}
