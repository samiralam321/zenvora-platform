"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight } from "lucide-react";

interface BannerSectionProps {
  data?: {
    heading?: string;
    subtext?: string;
    buttonText?: string;
    buttonUrl?: string;
  };
}

export default function BannerSection({ data = {} }: BannerSectionProps) {
  const heading = data.heading || "Discover Opportunities Beyond the Classroom";
  const subtext =
    data.subtext ||
    "Explore verified hackathons, open-source mentorships, coding championships, and internships tailored to your academic year.";
  const buttonText = data.buttonText || "Explore Opportunities";
  const buttonUrl = data.buttonUrl || "/opportunities";

  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-10 bg-[#EEF4FF] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="text-left max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#1D64EC] text-xs font-bold mb-3 uppercase tracking-wider border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Learning Sanctuary</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {heading}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {subtext}
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              href={buttonUrl}
              className="btn-primary w-full sm:w-auto px-6 py-3 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 shadow-sm"
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
