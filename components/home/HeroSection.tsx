"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";
import DomainCarousel3D from "./DomainCarousel3D";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  link?: string | null;
}

interface HeroSectionProps {
  data?: {
    h1?: string;
    subtext?: string;
    primaryBtn?: string;
    primaryUrl?: string;
    secondaryBtn?: string;
    secondaryUrl?: string;
  };
  latestVideos?: any[];
  categories?: CategoryItem[];
}

export default function HeroSection({
  data = {},
  categories = [],
}: HeroSectionProps) {
  const h1 = data.h1 || "Learn Tech the simplest way possible";
  const subtext =
    data.subtext ||
    "Curated roadmaps, step-by-step lectures, and practical project resources for students and self-taught developers. Stop getting lost in tutorial hell.";
  const primaryBtn = data.primaryBtn || "Explore Domains";
  const primaryUrl = data.primaryUrl || "/#domains";
  const secondaryBtn = data.secondaryBtn || "Student Resources";
  const secondaryUrl = data.secondaryUrl || "/watch-tutorials";

  // Split headline: bold prefix + gradient suffix
  const gradientPhrase = "simplest way possible";
  const headlineParts = h1.includes(gradientPhrase)
    ? [h1.replace(gradientPhrase, "").trimEnd(), gradientPhrase]
    : [h1, ""];

  return (
    <section
      className="relative text-white overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #061530 0%, #0B1B3D 35%, #102248 65%, #0d1f45 100%)",
        minHeight: "100vh",
        paddingTop: "clamp(80px, 10vw, 120px)",
        paddingBottom: "clamp(48px, 6vw, 80px)",
      }}
    >
      {/* ── Background Layers ── */}

      {/* Deep radial glow behind carousel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(29,100,236,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Soft ambient top arc glow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          top: "15%",
          width: "70%",
          height: "45%",
          background:
            "radial-gradient(ellipse 100% 80% at 50% 0%, rgba(29,100,236,0.22) 0%, transparent 65%)",
          filter: "blur(24px)",
        }}
      />

      {/* Subtle curved arc lines decorative */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg
          className="absolute w-full"
          style={{ top: "52%", opacity: 0.06 }}
          viewBox="0 0 1440 120"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M -80 100 Q 720 -40 1520 100"
            stroke="#60a5fa"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M -80 115 Q 720 -20 1520 115"
            stroke="#93c5fd"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>

      {/* Bottom fade to white (for page transition) */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "120px",
          background: "linear-gradient(to bottom, transparent 0%, rgba(6,21,48,0.9) 100%)",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Pill badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Curated Tech Learning Platform for Students</span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="text-center font-bold tracking-tight text-white leading-[1.1] mb-5"
          style={{ fontSize: "clamp(28px, 5.5vw, 60px)" }}
        >
          {headlineParts[1] ? (
            <>
              {headlineParts[0]}{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #60a5fa 0%, #3b82f6 40%, #818cf8 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {headlineParts[1]}
              </span>
            </>
          ) : (
            h1
          )}
        </h1>

        {/* Subtext */}
        <p
          className="text-center text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto mb-8"
          style={{ fontSize: "clamp(14px, 1.6vw, 17px)" }}
        >
          {subtext}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
          <Link
            href={primaryUrl}
            className="btn-primary px-6 py-2.5 text-sm font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <span>{primaryBtn}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href={secondaryUrl}
            className="btn-hero-secondary px-5 py-2.5 text-sm font-medium rounded-lg"
          >
            <span>{secondaryBtn}</span>
          </Link>
        </div>

        {/* ── 3D Carousel ── */}
        {categories.length > 0 && (
          <DomainCarousel3D categories={categories} />
        )}
      </div>
    </section>
  );
}
