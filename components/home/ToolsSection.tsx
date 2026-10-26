"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Wrench } from "lucide-react";

interface ToolItem {
  id: string;
  name: string;
  logo: string;
  oneLiner: string;
  description?: string | null;
  url: string;
  tag?: string | null;
}

interface ToolsSectionProps {
  data?: {
    heading?: string;
    subheading?: string;
    bottomLinkText?: string;
    bottomLinkUrl?: string;
  };
  tools?: ToolItem[];
}

export default function ToolsSection({
  data = {},
  tools = [],
}: ToolsSectionProps) {
  const heading = data.heading || "Essential Developer Tools";
  const subheading =
    data.subheading || "The battle-tested toolchain every modern engineer uses.";
  const bottomLinkText =
    data.bottomLinkText || "See all recommended tools";
  const bottomLinkUrl = data.bottomLinkUrl || "/recommended-tools";

  const displayTools = tools.slice(0, 6);

  const renderToolCard = (tool: ToolItem) => (
    <div
      key={tool.id}
      className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition p-6 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden relative">
            {tool.logo ? (
              <img
                src={tool.logo}
                alt={tool.name}
                width={28}
                height={28}
                className="w-7 h-7 object-contain"
                loading="lazy"
              />
            ) : (
              <Wrench className="w-5 h-5 text-slate-400" />
            )}
          </div>

          {tool.tag && (
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF4FF] text-[#1D64EC]">
              {tool.tag}
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          {tool.name}
        </h3>

        {tool.oneLiner && (
          <p className="text-xs font-semibold text-slate-700 mb-2">
            {tool.oneLiner}
          </p>
        )}

        {tool.description && (
          <p className="text-xs text-slate-500 leading-relaxed mb-6 line-clamp-3">
            {tool.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-[#1D64EC] flex items-center gap-1.5 hover:underline"
        >
          <span>Visit Tool</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 text-left">
          <span className="text-[11px] uppercase tracking-wider text-[#1D64EC] font-bold">
            CURATED DEVELOPER STACK
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mt-1 mb-2">
            {heading}
          </h2>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            {subheading}
          </p>
        </div>

        {/* Tools Grid: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {displayTools.map((tool) => renderToolCard(tool))}
        </div>

        {/* Bottom Link Button */}
        <div className="text-left">
          <Link
            href={bottomLinkUrl}
            className="border border-slate-200 hover:border-slate-300 bg-white text-slate-800 text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors inline-block"
          >
            {bottomLinkText}
          </Link>
        </div>
      </div>
    </section>
  );
}
