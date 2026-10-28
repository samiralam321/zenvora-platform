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
    iconName: "Binary",
    pastelBg: "#FFF4EC", // pale peach
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
    resources: [
      {
        id: "arrays-complete-notes",
        title: "Arrays in Depth - Complete Notes",
        description: "Learn array operations, contiguous memory layout, traversal, two-pointer patterns, searching, insertion, and FAANG interview problems.",
        topic: "Arrays",
        difficulty: "Beginner",
        pages: 42,
        lastUpdated: "Oct 2024",
        downloadFileName: "Zenvora-DSA-Arrays-Complete-Notes.pdf",
        outline: [
          { id: "intro", title: "1. Introduction to Arrays", pageNumber: 1 },
          { id: "memory-layout", title: "2. Memory Representation & Access Time", pageNumber: 2 },
          { id: "core-operations", title: "3. Core Operations & Time Complexity", pageNumber: 3 },
          { id: "two-pointers", title: "4. The Two-Pointer Pattern", pageNumber: 4 },
          { id: "sliding-window", title: "5. Sliding Window Technique", pageNumber: 5 },
          { id: "prefix-sum", title: "6. Prefix Sum & Range Query Optimization", pageNumber: 6 },
          { id: "kadane", title: "7. Kadane's Algorithm (Max Subarray)", pageNumber: 7 },
          { id: "interview-cheatsheet", title: "8. Summary & FAANG Interview Cheat Sheet", pageNumber: 8 },
        ],
        chapters: [
          {
            id: "intro",
            pageNumber: 1,
            title: "1. Introduction to Arrays",
            subtitle: "Foundation of Linear Data Structures",
            content: [
              {
                type: "paragraph",
                text: "An array is a linear data structure that stores elements of the same type in contiguous memory locations. It provides constant-time O(1) random access using numerical indexing, making it one of the most fundamental building blocks in computer science.",
              },
              {
                type: "points",
                heading: "Key Properties of Arrays:",
                points: [
                  "Fixed Size: Traditional static arrays have a fixed size determined at allocation.",
                  "Contiguous Memory: Elements reside side-by-side in RAM with no gaps.",
                  "Homogeneous Types: All elements share the exact same data type and byte width.",
                  "Zero-Based Indexing: The first element begins at index 0 (address offset = 0).",
                ],
              },
              {
                type: "note",
                heading: "Why Indexing is O(1) Time Complexity:",
                text: "Address of Element at index i = Base_Address + (i × Size_Of_Element). Because simple multiplication and addition take constant CPU cycles, accessing arr[i] requires exactly one memory lookup.",
              },
            ],
          },
          {
            id: "memory-layout",
            pageNumber: 2,
            title: "2. Memory Representation & Access Time",
            subtitle: "Physical RAM Mapping & Cache Locality",
            content: [
              {
                type: "paragraph",
                text: "Because array elements are stored contiguously, modern CPU architectures leverage spatial cache locality. When an element is fetched from RAM, adjacent elements are automatically pulled into the L1/L2 CPU cache lines (typically 64 bytes), speeding up sequential iterations by up to 10× over non-contiguous structures like linked lists.",
              },
              {
                type: "table",
                heading: "Array Operations Complexity Benchmark:",
                table: {
                  headers: ["Operation", "Best Case", "Average Case", "Worst Case"],
                  rows: [
                    ["Access by Index", "O(1)", "O(1)", "O(1)"],
                    ["Search (Unsorted)", "O(1)", "O(n)", "O(n)"],
                    ["Search (Sorted / Binary)", "O(1)", "O(log n)", "O(log n)"],
                    ["Insertion at End", "O(1) amortized", "O(1) amortized", "O(n) on resize"],
                    ["Insertion at Beginning", "O(n)", "O(n)", "O(n)"],
                    ["Deletion by Index", "O(1) at end", "O(n)", "O(n)"],
                  ],
                },
              },
            ],
          },
          {
            id: "core-operations",
            pageNumber: 3,
            title: "3. Core Operations & Code Implementations",
            subtitle: "Basic Manipulation in Modern Languages",
            content: [
              {
                type: "paragraph",
                text: "Below is the production-grade implementation of common array primitives including in-place reversal and linear vs binary search.",
              },
              {
                type: "code",
                code: {
                  language: "typescript",
                  snippet: `// In-Place Array Reversal using Two Pointers (O(n) time, O(1) space)
function reverseArray<T>(arr: T[]): T[] {
  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;
    left++;
    right--;
  }
  return arr;
}

// Binary Search on Sorted Array (O(log n) time, O(1) space)
function binarySearch(nums: number[], target: number): number {
  let low = 0;
  let high = nums.length - 1;

  while (low <= high) {
    // Prevent integer overflow
    const mid = low + Math.floor((high - low) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}`,
                },
              },
            ],
          },
          {
            id: "two-pointers",
            pageNumber: 4,
            title: "4. The Two-Pointer Pattern",
            subtitle: "Eliminating Nested Loops from O(n²) to O(n)",
            content: [
              {
                type: "paragraph",
                text: "The two-pointer technique uses two independent reference indices that traverse an array either toward each other, in the same direction, or from opposite ends. It is the premier pattern for solving sorted pair problems, partition questions, and palindromes.",
              },
              {
                type: "code",
                code: {
                  language: "typescript",
                  snippet: `// Two Sum II - Input Array Is Sorted
// Returns 1-based indices of the two numbers that add up to target
function twoSumSorted(numbers: number[], target: number): number[] {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const sum = numbers[left] + numbers[right];
    if (sum === target) {
      return [left + 1, right + 1];
    } else if (sum < target) {
      left++; // Sum is too small, advance left pointer to larger value
    } else {
      right--; // Sum is too large, move right pointer to smaller value
    }
  }
  return [];
}`,
                },
              },
              {
                type: "points",
                heading: "When to Apply Two Pointers:",
                points: [
                  "Sorted input arrays where you need pairs or triplets summing to a target.",
                  "Removing duplicates in-place from sorted arrays.",
                  "Trapping Rainwater or Container with Most Water problems.",
                  "Partitioning elements (like Dutch National Flag: 0s, 1s, and 2s).",
                ],
              },
            ],
          },
          {
            id: "sliding-window",
            pageNumber: 5,
            title: "5. Sliding Window Technique",
            subtitle: "Optimal Subarray Search & Tracking",
            content: [
              {
                type: "paragraph",
                text: "A sliding window is a contiguous subsegment of an array whose boundaries (start and end pointers) move along the array to satisfy dynamic constraints. It converts brute-force O(n × k) problems into linear O(n) passes.",
              },
              {
                type: "code",
                code: {
                  language: "typescript",
                  snippet: `// Maximum Sum Subarray of Fixed Size K (O(n) time, O(1) space)
function maxSubarraySum(arr: number[], k: number): number {
  if (arr.length < k) return 0;

  // Compute sum of first window
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += arr[i];
  let maxSum = windowSum;

  // Slide the window across the remaining elements
  for (let i = k; i < arr.length; i++) {
    windowSum += arr[i] - arr[i - k]; // Add new element, drop leftmost
    maxSum = Math.max(maxSum, windowSum);
  }

  return maxSum;
}`,
                },
              },
            ],
          },
          {
            id: "prefix-sum",
            pageNumber: 6,
            title: "6. Prefix Sum & Range Query Optimization",
            subtitle: "Precomputing Cumulative Totals for O(1) Queries",
            content: [
              {
                type: "paragraph",
                text: "The prefix sum array precomputes the cumulative sum from index 0 to i. Once created in O(n) time, any arbitrary range sum query from index L to R can be answered in exact O(1) constant time using the formula: Sum(L...R) = Prefix[R] - Prefix[L - 1].",
              },
              {
                type: "code",
                code: {
                  language: "typescript",
                  snippet: `class NumArray {
  private prefix: number[];

  constructor(nums: number[]) {
    this.prefix = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
      this.prefix[i + 1] = this.prefix[i] + nums[i];
    }
  }

  // Returns sum of elements nums[left...right] inclusive in O(1)
  sumRange(left: number, right: number): number {
    return this.prefix[right + 1] - this.prefix[left];
  }
}`,
                },
              },
            ],
          },
          {
            id: "kadane",
            pageNumber: 7,
            title: "7. Kadane's Algorithm",
            subtitle: "Maximum Subarray Problem in Single Linear Pass",
            content: [
              {
                type: "paragraph",
                text: "Kadane's algorithm computes the maximum subarray sum in a single linear pass O(n) time and O(1) space by maintaining a running current sum and greedily resetting it to 0 whenever it drops below zero.",
              },
              {
                type: "code",
                code: {
                  language: "typescript",
                  snippet: `function maxSubArray(nums: number[]): number {
  let currentSum = nums[0];
  let maxSoFar = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // Either extend the previous subarray or start fresh from nums[i]
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSoFar = Math.max(maxSoFar, currentSum);
  }

  return maxSoFar;
}`,
                },
              },
            ],
          },
          {
            id: "interview-cheatsheet",
            pageNumber: 8,
            title: "8. Summary & FAANG Interview Cheat Sheet",
            subtitle: "Fast Pattern Recognition Guide",
            content: [
              {
                type: "points",
                heading: "Interview Pattern Decision Framework:",
                points: [
                  "If array is sorted → Consider Two Pointers, Binary Search, or Dutch National Flag.",
                  "If problem asks for contiguous subarray/substring → Think Sliding Window or Kadane's.",
                  "If multiple range sum queries are required → Build Prefix Sum Array.",
                  "If finding pairs or frequencies in O(n) → Use Hash Map / Hash Set.",
                  "If modifying in-place with O(1) extra space → Two pointers (fast/slow or left/right).",
                ],
              },
              {
                type: "note",
                heading: "Pro Interview Tip:",
                text: "Always clarify with the interviewer: Can elements be negative? Is the array sorted? Are duplicate elements permitted? Can we modify the original input array in-place?",
              },
            ],
          },
        ],
        relatedNotes: [
          { id: "linked-list-notes", title: "Linked List Notes & Pointers", domainSlug: "dsa", pages: 36 },
          { id: "stack-and-queue-notes", title: "Stack and Queue Notes", domainSlug: "dsa", pages: 28 },
          { id: "dynamic-programming-patterns", title: "Dynamic Programming: 14 Core Patterns", domainSlug: "dsa", pages: 68 },
          { id: "dsa-cheat-sheet", title: "DSA Ultimate Revision Cheat Sheet", domainSlug: "dsa", pages: 18 },
        ],
      },
      {
        id: "linked-list-notes",
        title: "Linked Lists - Complete Conceptual Notes",
        description: "Singly, doubly, and circular linked lists, fast & slow pointer Floyd's cycle detection, reversals, and merge routines.",
        topic: "Linked Lists",
        difficulty: "Beginner",
        pages: 36,
        lastUpdated: "Sep 2024",
        downloadFileName: "Zenvora-DSA-Linked-Lists.pdf",
        outline: [
          { id: "ll-intro", title: "1. Singly vs Doubly Linked Lists", pageNumber: 1 },
          { id: "ll-floyd", title: "2. Floyd's Cycle Detection Algorithm", pageNumber: 2 },
          { id: "ll-reverse", title: "3. In-Place Reversal & Palindrome Check", pageNumber: 3 },
          { id: "ll-merge", title: "4. Merge Two Sorted Lists", pageNumber: 4 },
        ],
        chapters: [
          {
            id: "ll-intro",
            pageNumber: 1,
            title: "1. Singly vs Doubly Linked Lists",
            subtitle: "Non-contiguous dynamic node memory allocation",
            content: [
              {
                type: "paragraph",
                text: "Unlike arrays, linked lists allocate memory dynamically on the heap for each individual node. Each node contains data and one or more pointer references to adjacent nodes.",
              },
              {
                type: "code",
                code: {
                  language: "typescript",
                  snippet: `class ListNode {
  val: number;
  next: ListNode | null;
  constructor(val = 0, next: ListNode | null = null) {
    this.val = val;
    this.next = next;
  }
}`,
                },
              },
            ],
          },
          {
            id: "ll-floyd",
            pageNumber: 2,
            title: "2. Floyd's Cycle Detection (Tortoise and Hare)",
            subtitle: "O(n) time and O(1) memory cycle finding",
            content: [
              {
                type: "paragraph",
                text: "Move a slow pointer 1 step and a fast pointer 2 steps. If a cycle exists, they must eventually meet. To find the cycle entry node, reset slow to head and advance both 1 step at a time.",
              },
              {
                type: "code",
                code: {
                  language: "typescript",
                  snippet: `function detectCycle(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) {
      // Cycle found. Find entry point:
      let entry = head;
      while (entry !== slow) {
        entry = entry!.next;
        slow = slow!.next;
      }
      return entry;
    }
  }
  return null;
}`,
                },
              },
            ],
          },
        ],
        relatedNotes: [
          { id: "arrays-complete-notes", title: "Arrays in Depth - Complete Notes", domainSlug: "dsa", pages: 42 },
          { id: "stack-and-queue-notes", title: "Stack and Queue Notes", domainSlug: "dsa", pages: 28 },
        ],
      },
      {
        id: "stack-and-queue-notes",
        title: "Stack & Queue Mastery - LIFO and FIFO",
        description: "Monotonic stacks, next greater element, sliding window maximum, circular queues, and deque interview patterns.",
        topic: "Stacks & Queues",
        difficulty: "Intermediate",
        pages: 28,
        lastUpdated: "Aug 2024",
        downloadFileName: "Zenvora-DSA-Stack-and-Queue.pdf",
        outline: [
          { id: "sq-intro", title: "1. Stack & Queue Fundamentals", pageNumber: 1 },
          { id: "sq-mono", title: "2. Monotonic Stack Patterns", pageNumber: 2 },
        ],
        chapters: [
          {
            id: "sq-intro",
            pageNumber: 1,
            title: "1. Stack & Queue Fundamentals",
            subtitle: "LIFO vs FIFO Core Concepts",
            content: [
              {
                type: "paragraph",
                text: "Stacks operate on Last-In First-Out (LIFO). Queues operate on First-In First-Out (FIFO). Both provide O(1) push and pop operations.",
              },
            ],
          },
        ],
        relatedNotes: [
          { id: "arrays-complete-notes", title: "Arrays in Depth - Complete Notes", domainSlug: "dsa", pages: 42 },
        ],
      },
      {
        id: "dynamic-programming-patterns",
        title: "Dynamic Programming: 14 Core Patterns",
        description: "0/1 Knapsack, Unbounded Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, and DP on Trees.",
        topic: "Dynamic Programming",
        difficulty: "Advanced",
        pages: 68,
        lastUpdated: "Jul 2024",
        downloadFileName: "Zenvora-DSA-DP-Patterns.pdf",
        outline: [
          { id: "dp-intro", title: "1. Top-Down Memoization vs Bottom-Up Tabulation", pageNumber: 1 },
          { id: "dp-knapsack", title: "2. The 0/1 Knapsack Blueprint", pageNumber: 2 },
        ],
        chapters: [
          {
            id: "dp-intro",
            pageNumber: 1,
            title: "1. Top-Down Memoization vs Bottom-Up Tabulation",
            subtitle: "Overlapping Subproblems & Optimal Substructure",
            content: [
              {
                type: "paragraph",
                text: "Dynamic programming applies whenever a problem has optimal substructure (an optimal solution can be constructed from optimal solutions of subproblems) and overlapping subproblems.",
              },
            ],
          },
        ],
        relatedNotes: [
          { id: "arrays-complete-notes", title: "Arrays in Depth - Complete Notes", domainSlug: "dsa", pages: 42 },
        ],
      },
      {
        id: "dsa-cheat-sheet",
        title: "DSA Ultimate Quick Revision Cheat Sheet",
        description: "All essential formulas, time complexities, big-O cheat sheet, and recursion trees in one concise revision guide.",
        topic: "All Notes",
        difficulty: "Cheat Sheets",
        pages: 18,
        lastUpdated: "Nov 2024",
        downloadFileName: "Zenvora-DSA-Cheat-Sheet.pdf",
        outline: [
          { id: "cs-big-o", title: "1. Big-O Complexity Master Table", pageNumber: 1 },
        ],
        chapters: [
          {
            id: "cs-big-o",
            pageNumber: 1,
            title: "1. Big-O Complexity Master Table",
            subtitle: "Quick Reference for Every Classic Algorithm",
            content: [
              {
                type: "paragraph",
                text: "Keep this quick revision sheet handy right before interviews to review data structure access, search, and insertion limits.",
              },
            ],
          },
        ],
        relatedNotes: [
          { id: "arrays-complete-notes", title: "Arrays in Depth - Complete Notes", domainSlug: "dsa", pages: 42 },
        ],
      },
    ],
  },

  // ── 02: Web Development ───────────────────────────────────────────────────
  {
    id: "web-dev",
    slug: "web-dev",
    number: "02",
    name: "Web Development",
    shortName: "Web Dev Notes",
    description: "HTML, CSS, modern JavaScript, TypeScript, React, responsive UI engineering, and web performance.",
    iconName: "Code2",
    pastelBg: "#F0F4FF", // soft lavender-blue
    pastelBorder: "#DCE7FE",
    accentColor: "#2563EB",
    badgeBg: "#DBEAFE",
    badgeText: "#1E40AF",
    pinColor: "blue",
    rotationDeg: 3.2,
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
    resources: [
      {
        id: "javascript-deep-dive",
        title: "Namaste JavaScript & Execution Context Deep Dive",
        description: "Execution context, call stack, closures, prototypes, event loop, microtask queue, and asynchronous JavaScript.",
        topic: "Modern JavaScript (ES6+)",
        difficulty: "Intermediate",
        pages: 48,
        lastUpdated: "Oct 2024",
        downloadFileName: "Zenvora-WebDev-JavaScript-Deep-Dive.pdf",
        outline: [
          { id: "js-exec", title: "1. Execution Context & Hoisting", pageNumber: 1 },
          { id: "js-closures", title: "2. Scope Chain & Closures", pageNumber: 2 },
          { id: "js-eventloop", title: "3. Event Loop & Microtask Queue", pageNumber: 3 },
        ],
        chapters: [
          {
            id: "js-exec",
            pageNumber: 1,
            title: "1. Execution Context & Hoisting",
            subtitle: "Everything in JavaScript happens inside an Execution Context",
            content: [
              {
                type: "paragraph",
                text: "The Execution Context has two distinct phases: Phase 1 (Memory Creation Phase / Variable Environment) and Phase 2 (Code Execution Phase). Hoisting occurs because memory is allocated for variables and functions prior to line-by-line execution.",
              },
              {
                type: "points",
                heading: "Key Concepts:",
                points: [
                  "var is hoisted and initialized with undefined.",
                  "let and const are hoisted into the Temporal Dead Zone (TDZ) and cannot be accessed before initialization.",
                  "Function declarations are hoisted with their complete function definition.",
                ],
              },
            ],
          },
        ],
        relatedNotes: [
          { id: "react-internals-hooks", title: "React 19 & Next.js App Router Architecture", domainSlug: "web-dev", pages: 54 },
        ],
      },
      {
        id: "react-internals-hooks",
        title: "React 19 & Next.js App Router Architecture",
        description: "Virtual DOM reconciliation, fibers, hooks deep dive, Server Components vs Client Components, and streaming SSR.",
        topic: "React Architecture",
        difficulty: "Advanced",
        pages: 54,
        lastUpdated: "Nov 2024",
        downloadFileName: "Zenvora-WebDev-React-NextJS.pdf",
        outline: [
          { id: "react-reconcile", title: "1. React Fiber & Reconciliation", pageNumber: 1 },
        ],
        chapters: [
          {
            id: "react-reconcile",
            pageNumber: 1,
            title: "1. React Fiber & Reconciliation",
            subtitle: "How React schedules updates smoothly",
            content: [
              {
                type: "paragraph",
                text: "React Fiber is a complete rewrite of React's core reconciliation algorithm designed to enable incremental rendering and scheduling priority across concurrent updates.",
              },
            ],
          },
        ],
        relatedNotes: [
          { id: "javascript-deep-dive", title: "Namaste JavaScript & Execution Context Deep Dive", domainSlug: "web-dev", pages: 48 },
        ],
      },
    ],
  },

  // ── 03: Backend Development ───────────────────────────────────────────────
  {
    id: "backend-dev",
    slug: "backend-dev",
    number: "03",
    name: "Backend Development",
    shortName: "Backend Notes",
    description: "Node.js, Express, Go, SQL & NoSQL databases, RESTful APIs, and distributed backend fundamentals.",
    iconName: "Server",
    pastelBg: "#FEF9EE", // warm cream
    pastelBorder: "#FDEECC",
    accentColor: "#D97706",
    badgeBg: "#FEF3C7",
    badgeText: "#92400E",
    pinColor: "amber",
    rotationDeg: -2.6,
    topics: [
      "All Notes",
      "Node.js Internals & Libuv",
      "REST & API Design",
      "SQL & PostgreSQL",
      "MongoDB & NoSQL",
      "Caching with Redis",
      "Authentication & Security",
    ],
    resources: [
      {
        id: "backend-architecture-handbook",
        title: "Node.js & Express Production Backend Architecture",
        description: "Layered architecture (controllers, services, repositories), error handling middleware, validation with Zod, and rate limiting.",
        topic: "Node.js Internals & Libuv",
        difficulty: "Intermediate",
        pages: 46,
        lastUpdated: "Sep 2024",
        downloadFileName: "Zenvora-Backend-Architecture.pdf",
        outline: [
          { id: "be-layers", title: "1. 3-Tier Layered Architecture Pattern", pageNumber: 1 },
        ],
        chapters: [
          {
            id: "be-layers",
            pageNumber: 1,
            title: "1. 3-Tier Layered Architecture Pattern",
            subtitle: "Separation of concerns for production stability",
            content: [
              {
                type: "paragraph",
                text: "Organize backends into: Routes (HTTP endpoints), Controllers (request parsing & response codes), Services (business logic & transaction rules), and Repositories (database queries).",
              },
            ],
          },
        ],
        relatedNotes: [],
      },
    ],
  },

  // ── 04: Full Stack Development ────────────────────────────────────────────
  {
    id: "full-stack",
    slug: "full-stack",
    number: "04",
    name: "Full Stack Development",
    shortName: "Full Stack Notes",
    description: "End-to-end applications with Next.js, authentication, Prisma ORM, server actions, and cloud deployment.",
    iconName: "Layers",
    pastelBg: "#F0FDF4", // mint green
    pastelBorder: "#DCFCE7",
    accentColor: "#16A34A",
    badgeBg: "#DCFCE7",
    badgeText: "#166534",
    pinColor: "emerald",
    rotationDeg: 2.8,
    topics: [
      "All Notes",
      "Full Stack Architecture",
      "Auth & Session Management",
      "Prisma ORM & PostgreSQL",
      "Server Actions",
      "Deployment & CI/CD",
    ],
    resources: [
      {
        id: "fullstack-nextjs-blueprint",
        title: "The Modern Full Stack Next.js Architecture Blueprint",
        description: "Building production full-stack apps with Next.js 14/15, Tailwind, Prisma, NextAuth, and automated CI/CD pipelines.",
        topic: "Full Stack Architecture",
        difficulty: "Intermediate",
        pages: 62,
        lastUpdated: "Oct 2024",
        downloadFileName: "Zenvora-FullStack-Blueprint.pdf",
        outline: [
          { id: "fs-intro", title: "1. Modern Full-Stack Stack Selection", pageNumber: 1 },
        ],
        chapters: [
          {
            id: "fs-intro",
            pageNumber: 1,
            title: "1. Modern Full-Stack Stack Selection",
            subtitle: "Best practices for TypeScript across frontend and backend",
            content: [
              {
                type: "paragraph",
                text: "A unified TypeScript full-stack enables type-safe contracts from database schemas (Prisma) straight through to UI components.",
              },
            ],
          },
        ],
        relatedNotes: [],
      },
    ],
  },

  // ── 05: CS Fundamentals ───────────────────────────────────────────────────
  {
    id: "cs-fundamentals",
    slug: "cs-fundamentals",
    number: "05",
    name: "CS Fundamentals",
    shortName: "CS Fundamentals",
    description: "Operating Systems, Computer Networks, DBMS, and System Design core academic principles.",
    iconName: "Cpu",
    pastelBg: "#FAF5FF", // light purple
    pastelBorder: "#F3E8FF",
    accentColor: "#9333EA",
    badgeBg: "#F3E8FF",
    badgeText: "#6B21A8",
    pinColor: "purple",
    rotationDeg: -3.0,
    topics: [
      "All Notes",
      "Operating Systems",
      "Computer Networks",
      "DBMS & SQL",
      "Object-Oriented Programming",
    ],
    resources: [
      {
        id: "operating-systems-handbook",
        title: "Operating Systems: Processes, Threads & Memory Management",
        description: "Process synchronization, semaphores, deadlock avoidance (Banker's Algorithm), virtual memory, paging, and CPU scheduling algorithms.",
        topic: "Operating Systems",
        difficulty: "Beginner",
        pages: 58,
        lastUpdated: "Sep 2024",
        downloadFileName: "Zenvora-CS-Operating-Systems.pdf",
        outline: [
          { id: "os-process", title: "1. Processes vs Threads & PCB", pageNumber: 1 },
          { id: "os-deadlock", title: "2. The 4 Necessary Deadlock Conditions", pageNumber: 2 },
        ],
        chapters: [
          {
            id: "os-process",
            pageNumber: 1,
            title: "1. Processes vs Threads & PCB",
            subtitle: "Core CPU multitasking abstractions",
            content: [
              {
                type: "paragraph",
                text: "A process is a program in execution containing its own virtual address space (code, data, heap, stack). A thread is the smallest unit of execution within a process that shares code and heap memory.",
              },
            ],
          },
          {
            id: "os-deadlock",
            pageNumber: 2,
            title: "2. The 4 Necessary Deadlock Conditions",
            subtitle: "Coffman Conditions for System Deadlock",
            content: [
              {
                type: "points",
                heading: "A deadlock can occur if and only if all 4 conditions hold simultaneously:",
                points: [
                  "1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.",
                  "2. Hold and Wait: A process must be holding at least one resource and waiting for others.",
                  "3. No Preemption: Resources cannot be forcibly taken from a process.",
                  "4. Circular Wait: A closed chain of processes exists where each holds a resource needed by the next.",
                ],
              },
            ],
          },
        ],
        relatedNotes: [],
      },
    ],
  },

  // ── 06: Generative AI ─────────────────────────────────────────────────────
  {
    id: "gen-ai",
    slug: "gen-ai",
    number: "06",
    name: "Generative AI",
    shortName: "GenAI Notes",
    description: "LLMs, Prompt Engineering, LangChain, RAG architectures, and autonomous AI agent workflows.",
    iconName: "Sparkles",
    pastelBg: "#F0F9FF", // pale sky blue
    pastelBorder: "#E0F2FE",
    accentColor: "#0284C7",
    badgeBg: "#E0F2FE",
    badgeText: "#075985",
    pinColor: "cyan",
    rotationDeg: 3.4,
    topics: [
      "All Notes",
      "LLM Architectures",
      "Prompt Engineering",
      "RAG Systems & Vector DBs",
      "LangChain & LlamaIndex",
      "Autonomous AI Agents",
    ],
    resources: [
      {
        id: "rag-architecture-handbook",
        title: "Production RAG Architecture & Vector Search Systems",
        description: "Chunking strategies, embedding models, cosine similarity, vector databases (Pinecone, Qdrant, pgvector), and re-ranking pipelines.",
        topic: "RAG Systems & Vector DBs",
        difficulty: "Intermediate",
        pages: 55,
        lastUpdated: "Oct 2024",
        downloadFileName: "Zenvora-GenAI-RAG-Architecture.pdf",
        outline: [
          { id: "rag-pipeline", title: "1. End-to-End RAG Architecture Pipeline", pageNumber: 1 },
        ],
        chapters: [
          {
            id: "rag-pipeline",
            pageNumber: 1,
            title: "1. End-to-End RAG Architecture Pipeline",
            subtitle: "Combining external retrieval with generator LLMs",
            content: [
              {
                type: "paragraph",
                text: "Retrieval-Augmented Generation (RAG) grounds LLM outputs in verified proprietary documents to eliminate hallucinations and support private domain knowledge.",
              },
            ],
          },
        ],
        relatedNotes: [],
      },
    ],
  },

  // ── 07: Machine Learning ──────────────────────────────────────────────────
  {
    id: "ai-ml",
    slug: "ai-ml",
    number: "07",
    name: "Machine Learning",
    shortName: "ML Notes",
    description: "Mathematical foundations, supervised and unsupervised learning, PyTorch, and deep neural networks.",
    iconName: "Brain",
    pastelBg: "#F5F3FF", // light lilac
    pastelBorder: "#EDE9FE",
    accentColor: "#7C3AED",
    badgeBg: "#EDE9FE",
    badgeText: "#5B21B6",
    pinColor: "violet",
    rotationDeg: -2.4,
    topics: [
      "All Notes",
      "Linear Algebra & Calculus",
      "Supervised Learning",
      "Unsupervised Learning",
      "Neural Networks & PyTorch",
      "Transformers Architecture",
    ],
    resources: [
      {
        id: "machine-learning-mathematics",
        title: "Mathematics for Machine Learning: Vectors, Matrices & Gradients",
        description: "Eigenvalues, eigenvectors, singular value decomposition (SVD), partial derivatives, gradient descent optimization, and loss functions.",
        topic: "Linear Algebra & Calculus",
        difficulty: "Beginner",
        pages: 64,
        lastUpdated: "Aug 2024",
        downloadFileName: "Zenvora-ML-Mathematics.pdf",
        outline: [
          { id: "ml-grad", title: "1. Gradient Descent Mathematical Formulation", pageNumber: 1 },
        ],
        chapters: [
          {
            id: "ml-grad",
            pageNumber: 1,
            title: "1. Gradient Descent Mathematical Formulation",
            subtitle: "Finding local minima of continuous loss surfaces",
            content: [
              {
                type: "paragraph",
                text: "Weights are iteratively updated in the direction opposite to the gradient vector: W_new = W_old - (learning_rate × dL/dW).",
              },
            ],
          },
        ],
        relatedNotes: [],
      },
    ],
  },

  // ── 08: Competitive Programming ───────────────────────────────────────────
  {
    id: "competitive-programming",
    slug: "competitive-programming",
    number: "08",
    name: "Competitive Programming",
    shortName: "CP Notes",
    description: "Advanced problem-solving, speed coding techniques, bit manipulation, and mathematical algorithms.",
    iconName: "Trophy",
    pastelBg: "#FFF1F2", // soft coral
    pastelBorder: "#FFE4E6",
    accentColor: "#E11D48",
    badgeBg: "#FFE4E6",
    badgeText: "#9F1239",
    pinColor: "rose",
    rotationDeg: 2.9,
    topics: [
      "All Notes",
      "Number Theory & Sieve",
      "Two Pointers & Sliding Window",
      "Segment Trees & Fenwick",
      "Graph Flow Algorithms",
      "Bitmasking Dynamic Programming",
    ],
    resources: [
      {
        id: "cp-algorithms-compendium",
        title: "Competitive Programmer's Algorithms & Problem Patterns",
        description: "Prime factorization in log n, modular arithmetic, disjoint set union (DSU), Fenwick trees, and binary lifting for Lowest Common Ancestor (LCA).",
        topic: "Number Theory & Sieve",
        difficulty: "Advanced",
        pages: 72,
        lastUpdated: "Oct 2024",
        downloadFileName: "Zenvora-CP-Algorithms-Compendium.pdf",
        outline: [
          { id: "cp-sieve", title: "1. Sieve of Eratosthenes & Prime Factorization", pageNumber: 1 },
        ],
        chapters: [
          {
            id: "cp-sieve",
            pageNumber: 1,
            title: "1. Sieve of Eratosthenes & Prime Factorization",
            subtitle: "Precomputing primes up to 10^7 in O(n log log n)",
            content: [
              {
                type: "paragraph",
                text: "The Sieve of Eratosthenes is the standard method for finding all prime numbers up to any given limit by iteratively marking multiples of each prime as composite.",
              },
            ],
          },
        ],
        relatedNotes: [],
      },
    ],
  },

  // ── 09: System Design ─────────────────────────────────────────────────────
  {
    id: "system-design",
    slug: "system-design",
    number: "09",
    name: "System Design",
    shortName: "System Design Notes",
    description: "Scalable distributed architectures, high-availability design, caching, databases, and microservices.",
    iconName: "Network",
    pastelBg: "#EEF2FF", // muted periwinkle
    pastelBorder: "#E0E7FF",
    accentColor: "#4F46E5",
    badgeBg: "#E0E7FF",
    badgeText: "#3730A3",
    pinColor: "indigo",
    rotationDeg: -2.8,
    topics: [
      "All Notes",
      "Distributed Fundamentals",
      "Load Balancing & Proxies",
      "Caching (Redis / CDN)",
      "Database Sharding & Replication",
      "Message Queues (Kafka)",
      "Case Studies (URL Shortener, Chat)",
    ],
    resources: [
      {
        id: "system-design-interview-primer",
        title: "System Design Interview: Architectural Blueprints & Trade-offs",
        description: "The complete handbook for cracking Staff & SDE-2 system design rounds: CAP theorem, consistent hashing, rate limiting, and end-to-end designs.",
        topic: "Distributed Fundamentals",
        difficulty: "Advanced",
        pages: 80,
        lastUpdated: "Nov 2024",
        downloadFileName: "Zenvora-System-Design-Primer.pdf",
        outline: [
          { id: "sd-cap", title: "1. CAP Theorem & PACELC Trade-offs", pageNumber: 1 },
          { id: "sd-hashing", title: "2. Consistent Hashing & Virtual Nodes", pageNumber: 2 },
          { id: "sd-case-shortener", title: "3. Real-World Case Study: TinyURL / Bitly", pageNumber: 3 },
        ],
        chapters: [
          {
            id: "sd-cap",
            pageNumber: 1,
            title: "1. CAP Theorem & PACELC Trade-offs",
            subtitle: "Consistency vs Availability during Network Partitions",
            content: [
              {
                type: "paragraph",
                text: "In distributed computing, the CAP theorem states that a distributed data store can simultaneously provide at most two of three guarantees: Consistency (all nodes see the same data at the same time), Availability (every request receives a response), and Partition Tolerance (the system continues to operate despite arbitrary network dropped messages). Because network cables can always experience packet loss, Partition Tolerance is non-negotiable; thus systems must choose CP (e.g. MongoDB, HBase) or AP (e.g. Cassandra, DynamoDB).",
              },
            ],
          },
          {
            id: "sd-hashing",
            pageNumber: 2,
            title: "2. Consistent Hashing & Virtual Nodes",
            subtitle: "Minimizing re-keys when scaling cluster nodes",
            content: [
              {
                type: "paragraph",
                text: "Consistent hashing maps both servers and data keys to a circular ring [0, 2^32 - 1]. When a server node is added or removed, only k/N keys need to be remapped on average.",
              },
            ],
          },
          {
            id: "sd-case-shortener",
            pageNumber: 3,
            title: "3. Case Study: Designing a URL Shortener",
            subtitle: "High-read low-latency globally distributed service",
            content: [
              {
                type: "paragraph",
                text: "Requirements: 100M new URLs per day, 10:1 read-to-write ratio. Use Base62 encoding on a distributed unique ID generator (Snowflake) with Redis caching for hot redirection paths.",
              },
            ],
          },
        ],
        relatedNotes: [],
      },
    ],
  },
  // ── 10: DevOps & Cloud ──────────────────────────────────────────────────
  {
    id: "devops-cloud",
    slug: "devops-cloud",
    number: "10",
    name: "DevOps & Cloud Engineering",
    shortName: "DevOps & Cloud",
    description: "Docker containerization, Kubernetes orchestration, CI/CD automated deployment, and AWS cloud architecture.",
    iconName: "Server",
    pastelBg: "#F0FDF4",
    pastelBorder: "#DCFCE7",
    accentColor: "#15803D",
    badgeBg: "#DCFCE7",
    badgeText: "#166534",
    pinColor: "emerald",
    rotationDeg: 2.1,
    topics: [
      "All Notes",
      "Docker Containers",
      "Kubernetes & Pods",
      "CI/CD Pipelines",
      "Cloud Infrastructure (AWS/GCP)",
      "Monitoring & Observability",
    ],
    resources: [
      {
        id: "docker-kubernetes-handbook",
        title: "Docker & Kubernetes: Production Container Architecture",
        description: "Master multi-stage Docker builds, Kubernetes Pod scheduling, Services, Ingress controllers, and GitOps pipelines.",
        topic: "Docker Containers",
        difficulty: "Intermediate",
        pages: 64,
        lastUpdated: "Nov 2024",
        downloadFileName: "Zenvora-DevOps-Cloud-Handbook.pdf",
        outline: [
          { id: "docker-arch", title: "1. Containerization vs Virtualization", pageNumber: 1 },
          { id: "k8s-arch", title: "2. Kubernetes Control Plane Architecture", pageNumber: 2 },
        ],
        chapters: [
          {
            id: "docker-arch",
            pageNumber: 1,
            title: "1. Containerization vs Virtualization",
            subtitle: "Namespaces, cgroups, and layered UnionFS storage",
            content: [
              {
                type: "paragraph",
                text: "Unlike traditional virtual machines that bundle a guest operating system on top of a hypervisor, Docker containers share the host Linux kernel while isolating processes through namespaces (PID, NET, MNT, IPC, UTS) and enforcing resource constraints via cgroups (CPU, memory, I/O limits).",
              },
            ],
          },
          {
            id: "k8s-arch",
            pageNumber: 2,
            title: "2. Kubernetes Control Plane Architecture",
            subtitle: "kube-apiserver, etcd, scheduler, and controller-manager",
            content: [
              {
                type: "paragraph",
                text: "The Kubernetes control plane manages the desired state of a cluster. The API server serves as the front door, backed by the distributed consensus key-value store etcd. The scheduler assigns pods to optimal worker nodes based on resource requests and affinity rules.",
              },
            ],
          },
        ],
        relatedNotes: [],
      },
    ],
  },
];
