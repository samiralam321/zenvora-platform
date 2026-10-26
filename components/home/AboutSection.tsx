"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import CollabModal from "@/components/CollabModal";
import { CheckCircle2, Sparkles, BookOpen, Layers } from "lucide-react";

interface AboutSectionProps {
  data?: {
    heading?: string;
    title?: string;
    paragraph1?: string;
    paragraph2?: string;
    primaryBtn?: string;
    primaryUrl?: string;
    secondaryBtn?: string;
    secondaryUrl?: string;
    collabHeading?: string;
    email?: string;
    photoUrl?: string;
  };
}

export default function AboutSection({ data = {} }: AboutSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const heading = data.heading || "Why Zenvora?";
  const paragraph1 =
    data.paragraph1 ||
    "Every year, millions of students start learning to code—only to get stuck in tutorial hell, outdated videos, or disjointed crash courses. Zenvora was created to provide a single, crystal-clear learning sanctuary.";
  const paragraph2 =
    data.paragraph2 ||
    "We curate the highest-signal lectures, battle-tested roadmaps, and production starter repos across Web Dev, Backend, Full Stack, AI/ML and GenAI so you can spend less time searching and more time building.";
  const primaryBtn = data.primaryBtn || "Browse Lectures";
  const primaryUrl = data.primaryUrl || "/watch-tutorials";
  const secondaryBtn = data.secondaryBtn || "Explore Opportunities";
  const secondaryUrl = data.secondaryUrl || "/opportunities";
  const collabHeading =
    data.collabHeading || "SUGGEST A LECTURE OR ROADMAP";
  const email = data.email || "hello@zenvora.com";
  const photoUrl = data.photoUrl || "/images/zenvora-about.jpg";

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Zenvora Platform Showcase Graphic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md aspect-[882/1024]">
              <Image
                src={photoUrl}
                alt="Why Zenvora Platform"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 448px"
                className="object-contain"
              />
            </div>
          </div>

          {/* Right: Mission & Narrative */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEF4FF] text-[#1D64EC] text-xs font-bold mb-4 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Built for Students &amp; Builders</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-5">
              {heading}
            </h2>

            <div className="text-slate-600 text-base sm:text-lg leading-relaxed space-y-4 mb-6">
              <p>{paragraph1}</p>
              <p>{paragraph2}</p>
            </div>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#1D64EC] shrink-0" />
                <span>Curated 5 Core Tech Domains</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#1D64EC] shrink-0" />
                <span>Zero Fluff &bull; Direct YouTube Imports</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#1D64EC] shrink-0" />
                <span>Student Notes &amp; Starter Templates</span>
              </div>
              <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-[#1D64EC] shrink-0" />
                <span>100% Free &amp; Open Access</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link
                href={primaryUrl}
                className="btn-primary px-5 py-2.5 text-sm font-semibold rounded-lg"
              >
                {primaryBtn}
              </Link>

              <Link
                href={secondaryUrl}
                className="border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-sm font-semibold px-5 py-2.5 rounded-lg transition"
              >
                {secondaryBtn}
              </Link>
            </div>

            {/* Suggest Lecture Box */}
            <div className="w-full rounded-2xl p-6 sm:p-7 bg-[#EEF4FF] border border-blue-100/60">
              <span className="text-[11px] uppercase tracking-wider text-[#1D64EC] font-bold mb-1.5 block">
                {collabHeading}
              </span>
              <a
                href={`mailto:${email}?subject=Zenvora%20Lecture%20Suggestion`}
                className="font-bold text-slate-900 text-lg hover:text-[#1D64EC] transition-colors block text-left"
              >
                {email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && <CollabModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />}
    </section>
  );
}
