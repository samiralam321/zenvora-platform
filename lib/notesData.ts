export interface NoteChapterContent {
  type: "paragraph" | "points" | "code" | "table" | "note" | "formula";
  heading?: string;
  text?: string;
  points?: string[];
  code?: { language: string; snippet: string };
  table?: { headers: string[]; rows: string[][] };
}

export interface NoteChapter {
  id: string;
  pageNumber: number;
  title: string;
  subtitle?: string;
  content: NoteChapterContent[];
}

export interface NoteOutlineItem {
  id: string;
  title: string;
  pageNumber: number;
}

export interface RelatedNoteItem {
  id: string;
  title: string;
  domainSlug: string;
  pages: number;
}

export interface NoteResource {
  id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Cheat Sheets" | "Formulas";
  pages: number;
  lastUpdated: string;
  downloadFileName: string;
  storagePath?: string | null;
  outline: NoteOutlineItem[];
  chapters: NoteChapter[];
  relatedNotes: RelatedNoteItem[];
}

export interface DomainNotes {
  id: string;
  slug: string;
  number: string; // "01", "02", etc.
  name: string;
  shortName: string;
  description: string;
  iconName: string;
  pastelBg: string;
  pastelBorder: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  pinColor: "coral" | "blue" | "amber" | "emerald" | "purple" | "cyan" | "violet" | "rose" | "indigo";
  rotationDeg: number;
  topics: string[];
  resources: NoteResource[];
}

export const NOTES_DOMAINS: DomainNotes[] = [
  // ── 01: DSA ─────────────────────────────────────────────────────────────
  {
    id: "dsa",
    slug: "dsa",
    number: "01",
    name: "Data Structures & Algorithms (DSA)",
    shortName: "DSA Notes",
    description: "Master arrays, linked lists, trees, graphs, dynamic programming, and interview patterns.",
    iconName: "GitBranch",
    pastelBg: "#FFF4EC",
    pastelBorder: "#FDE5D4",
    accentColor: "#EA580C",
    badgeBg: "#FFEDD5",
    badgeText: "#9A3412",
    pinColor: "coral",
    rotationDeg: -3.2,
    topics: [
      "All Notes",
      "Arrays",
      "Strings",
      "Linked Lists",
      "Stacks & Queues",
      "Trees",
      "Graphs",
      "Dynamic Programming",
      "Searching & Sorting",
      "Greedy Algorithms",
      "Recursion",
      "Bit Manipulation",
    ],
    resources: [],
  },

  // ── 02: Web Development ─────────────────────────────────────────────────
  {
    id: "web-dev",
    slug: "web-dev",
    number: "02",
    name: "Web Development",
    shortName: "Web Dev Notes",
    description: "HTML, CSS, modern JavaScript, TypeScript, React, responsive UI engineering, and web performance.",
    iconName: "Code2",
    pastelBg: "#F0FDF4",
    pastelBorder: "#DCFCE7",
    accentColor: "#16A34A",
    badgeBg: "#DCFCE7",
    badgeText: "#15803D",
    pinColor: "emerald",
    rotationDeg: 2.5,
    topics: [
      "All Notes",
      "HTML5 & Semantic Web",
      "CSS3 & Flexbox/Grid",
      "Modern JavaScript (ES6+)",
      "TypeScript Core",
      "React Architecture",
      "Next.js App Router",
      "Web Performance",
    ],
    resources: [],
  },

  // ── 03: Backend Development ─────────────────────────────────────────────
  {
    id: "backend",
    slug: "backend",
    number: "03",
    name: "Backend Development",
    shortName: "Backend Notes",
    description: "Node.js, Express, Go, SQL & NoSQL databases, RESTful APIs, caching, and server architecture.",
    iconName: "Server",
    pastelBg: "#F5F3FF",
    pastelBorder: "#EDE9FE",
    accentColor: "#7C3AED",
    badgeBg: "#EDE9FE",
    badgeText: "#6D28D9",
    pinColor: "purple",
    rotationDeg: -1.8,
    topics: [
      "All Notes",
      "Node.js & Express",
      "Databases & SQL",
      "System Architecture",
      "APIs & Microservices",
      "Authentication & Security",
    ],
    resources: [],
  },

  // ── 04: Full Stack Development ──────────────────────────────────────────
  {
    id: "full-stack",
    slug: "full-stack",
    number: "04",
    name: "Full Stack Development",
    shortName: "Full Stack Notes",
    description: "End-to-end applications with Next.js, authentication, Prisma ORM, state management, and deployment.",
    iconName: "Layers",
    pastelBg: "#EFF6FF",
    pastelBorder: "#DBEAFE",
    accentColor: "#2563EB",
    badgeBg: "#DBEAFE",
    badgeText: "#1D4ED8",
    pinColor: "blue",
    rotationDeg: 3.1,
    topics: [
      "All Notes",
      "Next.js Fullstack",
      "Auth & Sessions",
      "Database Modeling",
      "Production Deployments",
    ],
    resources: [],
  },

  // ── 05: CS Fundamentals ─────────────────────────────────────────────────
  {
    id: "cs-fundamentals",
    slug: "cs-fundamentals",
    number: "05",
    name: "CS Fundamentals",
    shortName: "CS Fundamentals Notes",
    description: "Operating Systems, Computer Networks, DBMS, and System Design concepts simplified.",
    iconName: "BookOpen",
    pastelBg: "#FEF2F2",
    pastelBorder: "#FEE2E2",
    accentColor: "#DC2626",
    badgeBg: "#FEE2E2",
    badgeText: "#B91C1C",
    pinColor: "rose",
    rotationDeg: -2.4,
    topics: [
      "All Notes",
      "Operating Systems",
      "Computer Networks",
      "DBMS & SQL",
      "OOP Concepts",
    ],
    resources: [],
  },

  // ── 06: Generative AI ───────────────────────────────────────────────────
  {
    id: "genai",
    slug: "genai",
    number: "06",
    name: "Generative AI",
    shortName: "GenAI Notes",
    description: "LLMs, Prompt Engineering, LangChain, RAG architectures, and autonomous AI agent workflows.",
    iconName: "BrainCircuit",
    pastelBg: "#FAF5FF",
    pastelBorder: "#F3E8FF",
    accentColor: "#9333EA",
    badgeBg: "#F3E8FF",
    badgeText: "#7E22CE",
    pinColor: "violet",
    rotationDeg: 2.8,
    topics: [
      "All Notes",
      "GenAI Foundations",
      "Transformers & Attention",
      "Large Language Models",
      "Prompt Engineering",
      "Retrieval Augmented Generation",
      "Diffusion & Image Generation",
      "Fine-Tuning & Alignment",
      "Autonomous AI Agents",
    ],
    resources: [],
  },

  // ── 07: Machine Learning ────────────────────────────────────────────────
  {
    id: "machine-learning",
    slug: "machine-learning",
    number: "07",
    name: "Machine Learning",
    shortName: "ML Notes",
    description: "Mathematical foundations, supervised and unsupervised learning, deep learning, and PyTorch.",
    iconName: "Brain",
    pastelBg: "#ECFEFF",
    pastelBorder: "#CFFAFE",
    accentColor: "#0891B2",
    badgeBg: "#CFFAFE",
    badgeText: "#0E7490",
    pinColor: "cyan",
    rotationDeg: -3.5,
    topics: [
      "All Notes",
      "Linear Algebra & Calculus",
      "Supervised Learning",
      "Deep Learning Foundations",
      "PyTorch Workflows",
    ],
    resources: [],
  },

  // ── 08: Competitive Programming ─────────────────────────────────────────
  {
    id: "competitive-programming",
    slug: "competitive-programming",
    number: "08",
    name: "Competitive Programming",
    shortName: "CP Notes",
    description: "Advanced problem-solving, speed coding techniques, bit manipulation, math, and contest patterns.",
    iconName: "Trophy",
    pastelBg: "#FFFBEB",
    pastelBorder: "#FEF3C7",
    accentColor: "#D97706",
    badgeBg: "#FEF3C7",
    badgeText: "#B45309",
    pinColor: "amber",
    rotationDeg: 1.9,
    topics: [
      "All Notes",
      "Number Theory",
      "Combinatorics",
      "Game Theory",
      "Graph Algorithms",
      "Advanced DP",
    ],
    resources: [],
  },

  // ── 09: System Design ───────────────────────────────────────────────────
  {
    id: "system-design",
    slug: "system-design",
    number: "09",
    name: "System Design",
    shortName: "System Design Notes",
    description: "Scalable distributed architectures, high-availability microservices, load balancing, and caching strategies.",
    iconName: "Workflow",
    pastelBg: "#F8FAFC",
    pastelBorder: "#E2E8F0",
    accentColor: "#475569",
    badgeBg: "#E2E8F0",
    badgeText: "#334155",
    pinColor: "indigo",
    rotationDeg: -2.1,
    topics: [
      "All Notes",
      "Horizontal vs Vertical Scaling",
      "Load Balancing",
      "Caching (Redis, Memcached)",
      "Database Sharding & Replication",
      "CAP Theorem",
      "Rate Limiting",
    ],
    resources: [],
  },

  // ── 10: DevOps & Cloud Engineering ──────────────────────────────────────
  {
    id: "devops-cloud",
    slug: "devops-cloud",
    number: "10",
    name: "DevOps & Cloud Engineering",
    shortName: "DevOps Notes",
    description: "Docker containerization, Kubernetes orchestration, CI/CD pipelines, AWS infrastructure, and Terraform.",
    iconName: "Cloud",
    pastelBg: "#EEF2FF",
    pastelBorder: "#E0E7FF",
    accentColor: "#4F46E5",
    badgeBg: "#E0E7FF",
    badgeText: "#3730A3",
    pinColor: "blue",
    rotationDeg: 2.7,
    topics: [
      "All Notes",
      "Docker Fundamentals",
      "Kubernetes Architecture",
      "CI/CD with GitHub Actions",
      "Terraform Infrastructure as Code",
      "AWS Core Services",
    ],
    resources: [],
  },
];

const DOMAIN_SLUG_ALIASES: Record<string, string> = {
  "gen-ai": "genai",
  "backend-dev": "backend",
  "ai-ml": "machine-learning",
  "devops-cloud": "devops-cloud",
};

/**
 * Returns suggested specialization topics for a given domain slug
 */
export function getSuggestedSpecializations(domainSlug?: string): string[] {
  if (!domainSlug) return [];
  const normalized = domainSlug.toLowerCase().trim();
  const mapped = DOMAIN_SLUG_ALIASES[normalized] || normalized;
  const domain = NOTES_DOMAINS.find(
    (d) =>
      d.slug === mapped ||
      d.id === mapped ||
      d.slug === normalized ||
      d.id === normalized ||
      d.slug.replace(/[^a-z0-9]/g, "") === normalized.replace(/[^a-z0-9]/g, "")
  );
  if (!domain) return [];
  return domain.topics.filter((t) => t !== "All Notes");
}
