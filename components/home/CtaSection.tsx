"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface CtaSectionProps {
  data?: {
    heading?: string;
    subtext?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
}

export default function CtaSection({ data = {} }: CtaSectionProps) {
  const heading =
    data.heading || "Ready to Master Modern Engineering?";
  const subtext =
    data.subtext ||
    "Join thousands of students and self-taught developers building real-world projects today. No paywalls, no tutorial hell.";
  const buttonText = data.buttonText || "Explore All Domains";
  const buttonUrl = data.buttonUrl || "/#domains";

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navy Card matching Screenshot */}
        <div className="relative rounded-3xl bg-[#0B1E48] p-10 sm:p-14 text-white text-left overflow-hidden shadow-xl">
          {/* Subtle radial ambient blue glow on right side */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 blur-[100px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-semibold mb-4 backdrop-blur-xs border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zenvora Curriculum 2026</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mb-3">
              {heading}
            </h2>

            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed max-w-xl">
              {subtext}
            </p>

            <Link
              href={buttonUrl}
              className="btn-primary px-6 py-3 text-sm inline-flex items-center gap-2 shadow-sm font-semibold rounded-lg"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
