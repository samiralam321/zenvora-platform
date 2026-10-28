import React from "react";
import {
  GitBranch,
  Network,
  Code2,
  Server,
  Layers,
  BookOpen,
  BrainCircuit,
  Brain,
  Trophy,
  Workflow,
  Cloud,
  Cpu,
  Binary,
  Sparkles,
  FileText,
  Terminal,
  Database,
  Globe,
  LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  // Canonical category slug mappings
  dsa: GitBranch,
  "web-dev": Code2,
  "backend-dev": Server,
  "full-stack": Layers,
  "cs-fundamentals": BookOpen,
  "gen-ai": BrainCircuit,
  "generative-ai": BrainCircuit,
  "ai-ml": Brain,
  ml: Brain,
  "competitive-programming": Trophy,
  cp: Trophy,
  "system-design": Workflow,
  "devops-cloud": Cloud,
  devops: Cloud,

  // Icon name mappings (case-insensitive keys handled in lookup)
  gitbranch: GitBranch,
  network: Network,
  code2: Code2,
  code: Code2,
  server: Server,
  layers: Layers,
  bookopen: BookOpen,
  book: BookOpen,
  braincircuit: BrainCircuit,
  brain: Brain,
  trophy: Trophy,
  workflow: Workflow,
  cloud: Cloud,
  cpu: Cpu,
  binary: Binary,
  sparkles: Sparkles,
  filetext: FileText,
  terminal: Terminal,
  database: Database,
  globe: Globe,
};

/**
 * Returns a proper LucideIcon component for any category domain.
 * Evaluates slug, iconName, and category title before falling back safely to BookOpen.
 */
export function getCategoryIcon(domain?: {
  slug?: string | null;
  name?: string | null;
  iconName?: string | null;
}): LucideIcon {
  if (!domain) return BookOpen;

  // 1. Check slug
  const slugKey = domain.slug?.toLowerCase().trim();
  if (slugKey && CATEGORY_ICONS[slugKey]) {
    return CATEGORY_ICONS[slugKey];
  }

  // 2. Check iconName
  const iconKey = domain.iconName?.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (iconKey && CATEGORY_ICONS[iconKey]) {
    return CATEGORY_ICONS[iconKey];
  }

  // 3. Check name heuristics for dynamically created categories
  const nameLower = domain.name?.toLowerCase() || "";
  if (
    nameLower.includes("data structure") ||
    nameLower.includes("dsa") ||
    nameLower.includes("algorithm")
  ) {
    return GitBranch;
  }
  if (nameLower.includes("web") || nameLower.includes("frontend")) {
    return Code2;
  }
  if (nameLower.includes("backend") || nameLower.includes("api")) {
    return Server;
  }
  if (nameLower.includes("full stack") || nameLower.includes("fullstack")) {
    return Layers;
  }
  if (
    nameLower.includes("fundamental") ||
    nameLower.includes("core") ||
    nameLower.includes("cs")
  ) {
    return BookOpen;
  }
  if (nameLower.includes("genai") || nameLower.includes("generative")) {
    return BrainCircuit;
  }
  if (
    nameLower.includes("machine learning") ||
    nameLower.includes("ai") ||
    nameLower.includes("ml")
  ) {
    return Brain;
  }
  if (nameLower.includes("competitive") || nameLower.includes("contest")) {
    return Trophy;
  }
  if (
    nameLower.includes("system design") ||
    nameLower.includes("architecture")
  ) {
    return Workflow;
  }
  if (
    nameLower.includes("devops") ||
    nameLower.includes("cloud") ||
    nameLower.includes("docker") ||
    nameLower.includes("kubernetes")
  ) {
    return Cloud;
  }

  // 4. Safe fallback
  return BookOpen;
}
