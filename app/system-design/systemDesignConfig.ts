/**
 * System Design Learning Resources Configuration
 *
 * Videos are managed exclusively via the Admin Panel.
 * Add playlists and videos for each resource through the Admin Panel
 * under the "System Design" category. They will automatically appear here.
 *
 * Resource order and titles are defined here; videos come from the DB.
 */

export interface SystemDesignResource {
  id: string;
  stepNumber: number;
  stepCategory: "beginner" | "intermediate" | "advanced" | "pdf";
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Free Resource";
  buttonText: string;
  url: string;
  instructor?: string;
  badgeText?: string;
  description: string;
}

export const SYSTEM_DESIGN_RESOURCES: SystemDesignResource[] = [
  {
    id: "sd-beginner",
    stepNumber: 1,
    stepCategory: "beginner",
    title: "System Design (Absolute Beginner)",
    level: "Beginner",
    buttonText: "YouTube Playlist Link",
    url: "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX",
    badgeText: "Foundational • Core Architecture",
    description:
      "Core mental models: client-server communication, horizontal vs. vertical scaling, latency, throughput, and high-availability design.",
  },
  {
    id: "sd-intermediate",
    stepNumber: 2,
    stepCategory: "intermediate",
    title: "System Design (Intermediate)",
    level: "Intermediate",
    buttonText: "YouTube Playlist Link",
    url: "https://www.youtube.com/playlist?list=PLCRMIe5FDPsdz8fG5Kq_p_GqT0zE0eL1j",
    badgeText: "Intermediate • Distributed Building Blocks",
    description:
      "Essential infrastructure primitives: Layer 4/7 load balancing, Redis caching patterns, database partitioning, and asynchronous message queues.",
  },
  {
    id: "sd-jordan",
    stepNumber: 3,
    stepCategory: "advanced",
    title: "System Design by Jordan has no life (Advanced)",
    level: "Advanced",
    buttonText: "YouTube Playlist Link",
    instructor: "Jordan has no life",
    badgeText: "Ex-Google Engineer • Whiteboard Breakdowns",
    url: "https://www.youtube.com/@Jordanhasnolife/playlists",
    description:
      "Advanced whiteboard breakdowns, distributed consensus algorithms, and end-to-end system designs from an ex-Google engineer.",
  },
  {
    id: "sd-gaurav",
    stepNumber: 4,
    stepCategory: "advanced",
    title: "System Design by Gaurav Sen (Advanced)",
    level: "Advanced",
    buttonText: "YouTube Playlist Link",
    instructor: "Gaurav Sen",
    badgeText: "Industry Benchmark • Architectural Analysis",
    url: "https://www.youtube.com/playlist?list=PLMCXHnjXnTnvo6alSjVkgxV-VH6EPyvoX",
    description:
      "The gold standard for real-world production engineering: consistent hashing, WhatsApp messaging architecture, and distributed rate limiters.",
  },
  {
    id: "sd-hello-interview",
    stepNumber: 5,
    stepCategory: "advanced",
    title: "System Design by Hello Interview (Advanced)",
    level: "Advanced",
    buttonText: "YouTube Playlist Link",
    instructor: "Hello Interview",
    badgeText: "Meta Staff Engineer • FAANG Mock Interviews",
    url: "https://www.youtube.com/@hello_interview/videos",
    description:
      "Realistic FAANG mock interview walkthroughs led by former Meta Staff Engineers. Learn how to structure 45-minute interviews under real constraints.",
  },
  {
    id: "sd-book-pdf",
    stepNumber: 6,
    stepCategory: "pdf",
    title: "Best Resource (Book PDF) Free Download",
    level: "Free Resource",
    buttonText: "Download NOW!",
    url: "https://github.com/donnemartin/system-design-primer",
    badgeText: "Free Download • Complete Reference Book & Primer",
    description:
      "The definitive open-source guide and PDF handbook for mastering system design interviews. Contains comprehensive architectural blueprints, trade-off comparisons, real-world case studies, and interview cheat sheets.",
  },
];
