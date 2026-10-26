"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Code2,
  Server,
  Layers,
  Cpu,
  Sparkles,
  Database,
  Smartphone,
  Cloud,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { startSmoothNavigation } from "@/components/NavigationProgress";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  link?: string | null;
}

interface CategorySectionProps {
  data?: {
    heading?: string;
    subheading?: string;
  };
  categories?: CategoryItem[];
}

export default function CategorySection({
  categories = [],
}: CategorySectionProps) {
  const router = useRouter();
  const [navigatingSlug, setNavigatingSlug] = useState<string | null>(null);

  const getIcon = (slug: string, iconName?: string | null) => {
    const s = (slug || "").toLowerCase();
    const ic = (iconName || "").toLowerCase();

    if (s.includes("backend") || ic.includes("server")) {
      return <Server className="w-5 h-5 text-[#1D64EC]" />;
    }
    if (s.includes("full") || ic.includes("layer")) {
      return <Layers className="w-5 h-5 text-[#1D64EC]" />;
    }
    if (s.includes("ml") || s.includes("ai-ml") || ic.includes("cpu")) {
      return <Cpu className="w-5 h-5 text-[#1D64EC]" />;
    }
    if (s.includes("gen") || ic.includes("sparkle")) {
      return <Sparkles className="w-5 h-5 text-[#1D64EC]" />;
    }
    if (s.includes("data") || ic.includes("database")) {
      return <Database className="w-5 h-5 text-[#1D64EC]" />;
    }
    if (s.includes("phone") || s.includes("mobile") || ic.includes("mobile")) {
      return <Smartphone className="w-5 h-5 text-[#1D64EC]" />;
    }
    if (s.includes("cloud") || s.includes("devops") || ic.includes("cloud")) {
      return <Cloud className="w-5 h-5 text-[#1D64EC]" />;
    }
    if (s.includes("competitive") || s.includes("cp") || ic.includes("trophy") || ic.includes("award")) {
      return <Trophy className="w-5 h-5 text-[#1D64EC]" />;
    }
    return <Code2 className="w-5 h-5 text-[#1D64EC]" />;
  };

  // Per-domain pastel card backgrounds — each card has its own unique color
  const getCardBg = (slug: string): string => {
    const s = (slug || "").toLowerCase();

    // ── Row 1 — each has its own unique pastel ──────────────────────────────
    if (s.includes("dsa") || s.includes("data-structure") || s.includes("algorithm"))
      return "linear-gradient(160deg, #fff8f0 0%, #ffecd8 55%, #ffd8b0 100%)"; // warm peach/orange
    if (s.includes("web") || s.includes("webdev") || s.includes("web-dev") || s.includes("frontend"))
      return "linear-gradient(160deg, #f8f0ff 0%, #eedad8 55%, #e0c8ff 100%)"; // soft violet/purple
    if (s.includes("backend") || s.includes("back-end") || s.includes("server"))
      return "linear-gradient(160deg, #fff0f5 0%, #ffe0ea 55%, #ffc8d8 100%)"; // light rose/pink
    if (s.includes("full") || s.includes("fullstack") || s.includes("full-stack"))
      return "linear-gradient(160deg, #f0f8ff 0%, #d8efff 55%, #b8e0ff 100%)"; // sky blue / indigo
    if (s.includes("cs") || s.includes("fundamental") || s.includes("computer-science"))
      return "linear-gradient(160deg, #f8fff0 0%, #e8ffd8 55%, #d0ffb0 100%)"; // light lime/green

    // ── Row 2 — unique pastels ───────────────────────────────────────────────
    if (s.includes("gen") || s.includes("genai"))
      return "linear-gradient(160deg, #f5f0ff 0%, #ece4ff 55%, #ddd0ff 100%)"; // soft lavender
    if (s.includes("ml") || s.includes("ai-ml") || s.includes("machine"))
      return "linear-gradient(160deg, #f0fff8 0%, #e0faef 55%, #c8f5e0 100%)"; // mint green
    if (s.includes("competitive") || s.includes("cp"))
      return "linear-gradient(160deg, #fffef0 0%, #fffbe0 55%, #fff4c0 100%)"; // warm yellow
    if (s.includes("system") || s.includes("system-design"))
      return "linear-gradient(160deg, #f0fffe 0%, #e0fafa 55%, #c8f5f5 100%)"; // light teal

    // Fallback
    return "linear-gradient(160deg, #eef3ff 0%, #e2ecff 55%, #d0e2ff 100%)";
  };

  const handleCardClick = (e: React.MouseEvent, destination: string, slug: string) => {
    if (destination.startsWith("http")) return; // Let external links behave normally
    e.preventDefault();
    if (navigatingSlug) return;

    setNavigatingSlug(slug);
    startSmoothNavigation();

    setTimeout(() => {
      router.push(destination);
    }, 180);
  };

  return (
    <section id="domains" className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
        {categories.map((cat) => {
          const destination = cat.link || `/watch-tutorials?category=${cat.slug}`;
          const isExternal = destination.startsWith("http");
          const isNavigating = navigatingSlug === cat.slug;

          return (
            <a
              key={cat.id}
              href={destination}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              onClick={(e) => handleCardClick(e, destination, cat.slug)}
              className={`card-bevel-emboss rounded-2xl p-5 sm:p-6 flex flex-col justify-between group block cursor-pointer transition-all duration-200 ${
                isNavigating
                  ? "scale-[0.98] ring-2 ring-[#1D64EC] border-[#1D64EC]"
                  : "active:scale-[0.99]"
              }`}
              style={{ background: getCardBg(cat.slug) }}
            >
              <div>
                {/* Tactile Embossed icon medallion */}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-white to-[#EEF4FF] flex items-center justify-center mb-4 transition-all duration-200 group-hover:scale-105 shadow-[inset_0_1.5px_0_rgba(255,255,255,1),inset_0_-1.5px_0_rgba(29,100,236,0.18),0_2px_5px_rgba(29,100,236,0.12)] border border-blue-100/90">
                  {getIcon(cat.slug, cat.icon)}
                </div>

                {/* H3 Title */}
                <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-1.5 group-hover:text-[#1D64EC] transition-colors flex items-center justify-between">
                  <span>{cat.name}</span>
                  <ArrowRight className={`w-3.5 h-3.5 text-slate-300 transition-all ${
                    isNavigating
                      ? "opacity-100 text-[#1D64EC] translate-x-1"
                      : "opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-[#1D64EC]"
                  }`} />
                </h3>

                {/* Description */}
                <p className="text-slate-500 text-xs leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100/80 flex items-center justify-between text-[11px] font-semibold text-[#1D64EC]">
                <span>{isNavigating ? "Opening..." : "Explore Track"}</span>
                <span className={`transition-transform duration-200 ${isNavigating ? "translate-x-1" : "group-hover:translate-x-0.5"}`}>
                  &rarr;
                </span>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
