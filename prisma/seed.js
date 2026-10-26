const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Zenvora Education Platform database...');

  // 1. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'samir@zenvora.com';
  const rawPassword = process.env.ADMIN_PASSWORD || 'SamirZenvora@2026';
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: {
      email: adminEmail,
      passwordHash,
    },
  });
  console.log(`Admin user seeded: ${adminEmail}`);

  // 2. Site Settings
  const defaultSettings = {
    brandName: 'Zenvora',
    creatorName: 'Samir',
    tagline: 'Curated Tech Learning Platform for Students & Builders',
    headline: 'Learn Tech the simplest way possible',
    subheadline: 'Curated roadmaps, step-by-step lectures, and practical project resources for students and self-taught developers. Stop getting lost in tutorial hell.',
    heroPrimaryCta: 'Explore Domains',
    heroPrimaryLink: '/#domains',
    heroSecondaryCta: 'Student Resources',
    heroSecondaryLink: '/resources',
    logoUrl: '/images/zenvora-logo.png',
    avatarUrl: '/images/zenvora-logo.png',
    aboutPhotoUrl: '/images/zenvora-about.jpg',
    faviconUrl: '/favicon.ico',
    ogImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
    youtubeUrl: 'https://youtube.com',
    youtubeChannelId: '',
    instagramUrl: 'https://instagram.com/zenvora',
    instagramHandle: '@zenvora',
    telegramUrl: '',
    whatsappNumber: '',
    businessEmail: 'hello@zenvora.com',
    agencyName: 'Zenvora',
    footerText: 'Empowering students and self-taught developers to learn tech the simplest way possible.',
    affiliateDisclosureEnabled: true,
    affiliateDisclosureText: 'Some links on this site may be resource partnerships. We only recommend tools battle-tested by modern engineers.',
    scrollToTopEnabled: true,
    unlockMode: 'required',
    shortsEnabled: true,
    watchModalEnabled: false,
    metaPixelId: '',
    googleAnalyticsId: '',
    customHeadCode: '',
    customBodyCode: '',
  };

  await prisma.setting.upsert({
    where: { key: 'site_settings' },
    update: { value: JSON.stringify(defaultSettings) },
    create: {
      key: 'site_settings',
      value: JSON.stringify(defaultSettings),
    },
  });

  // 3. Navigation Items
  const navItems = [
    { area: 'header', label: 'Explore Domains', url: '/#domains', order: 1, visible: true, isButton: false },
    { area: 'header', label: 'Lectures', url: '/watch-tutorials', order: 2, visible: true, isButton: false },
    { area: 'header', label: 'System Design', url: '/system-design', order: 3, visible: true, isButton: false },
    { area: 'header', label: 'Competitive Programming', url: '/competitive-programming', order: 4, visible: true, isButton: false },
    { area: 'header', label: 'Opportunities', url: '/opportunities', order: 5, visible: true, isButton: false },
    { area: 'header', label: 'Developer Tools', url: '/recommended-tools', order: 6, visible: true, isButton: false },
    { area: 'header', label: 'Free Resources', url: '/resources', order: 7, visible: true, isButton: true },
  ];

  await prisma.navItem.deleteMany({});
  for (const item of navItems) {
    await prisma.navItem.create({ data: item });
  }

  // 4. Learning Domains / Categories
  const categoriesData = [
    {
      name: 'Data Structures & Algorithms',
      slug: 'dsa',
      icon: 'Trophy',
      description: 'Master foundational problem solving, patterns, trees, graphs, and dynamic programming for coding interviews.',
      link: '/watch-tutorials?category=dsa',
      order: 1,
    },
    {
      name: 'Full Stack & Web Dev',
      slug: 'web-development',
      icon: 'Layers',
      description: 'Build end-to-end modern web applications with Next.js, React, Tailwind CSS, TypeScript, and Prisma.',
      link: '/watch-tutorials?category=web-development',
      order: 2,
    },
    {
      name: 'Backend Engineering',
      slug: 'backend-engineering',
      icon: 'Server',
      description: 'Design scalable distributed systems, RESTful and GraphQL APIs, caching, and microservices architectures.',
      link: '/watch-tutorials?category=backend-engineering',
      order: 3,
    },
    {
      name: 'System Design',
      slug: 'system-design',
      icon: 'Cpu',
      description: 'Learn high-level and low-level architectural patterns for building high-scale real-world applications.',
      link: '/system-design',
      order: 4,
    },
    {
      name: 'Machine Learning & AI',
      slug: 'machine-learning',
      icon: 'Sparkles',
      description: 'Understand neural networks, computer vision, NLP, and train practical models from scratch to deployment.',
      link: '/watch-tutorials?category=machine-learning',
      order: 5,
    },
    {
      name: 'Generative AI & LLMs',
      slug: 'generative-ai',
      icon: 'Bot',
      description: 'Build autonomous agents, RAG pipelines, fine-tuned models, and intelligent AI-powered applications.',
      link: '/watch-tutorials?category=generative-ai',
      order: 6,
    },
    {
      name: 'Competitive Programming',
      slug: 'competitive-programming',
      icon: 'Trophy',
      description: 'Level up on Codeforces, LeetCode, and contest algorithms with structured problem sets and editorial breakdowns.',
      link: '/competitive-programming',
      order: 7,
    },
    {
      name: 'CS Fundamentals',
      slug: 'cs-fundamentals',
      icon: 'Database',
      description: 'Core computer science essentials: Operating Systems, DBMS, Computer Networks, and Object-Oriented Design.',
      link: '/watch-tutorials?category=cs-fundamentals',
      order: 8,
    },
  ];

  await prisma.category.deleteMany({});
  const createdCategories = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat });
    createdCategories[cat.slug] = c;
  }

  // 5. Curated Playlists
  const playlistsData = [
    {
      title: "Striver's A2Z DSA Course",
      slug: 'strivers-a2z-dsa',
      channelName: 'take U forward',
      channelUrl: 'https://youtube.com/@takeUforward',
      thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc141e97d4d?w=800&auto=format&fit=crop&q=80',
      description: 'The definitive complete roadmap for Data Structures & Algorithms from basics to advanced interview problems.',
      categoryId: createdCategories['dsa'].id,
      order: 1,
      featured: true,
      visible: true,
    },
    {
      title: 'Full Stack Next.js 14 Masterclass',
      slug: 'fullstack-nextjs-masterclass',
      channelName: 'CodeHelp',
      channelUrl: 'https://youtube.com/@CodeHelp',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      description: 'Comprehensive hands-on guide to building full stack production web applications with React, Next.js, and TypeScript.',
      categoryId: createdCategories['web-development'].id,
      order: 2,
      featured: true,
      visible: true,
    },
    {
      title: 'Backend Engineering & Distributed Systems',
      slug: 'backend-distributed-systems',
      channelName: 'Hussein Nasser',
      channelUrl: 'https://youtube.com/@HusseinNasser-software-engineering',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      description: 'Deep dive into networking protocols, HTTP/2, WebSockets, database indexing, and backend architectures.',
      categoryId: createdCategories['backend-engineering'].id,
      order: 3,
      featured: true,
      visible: true,
    },
    {
      title: 'System Design for Tech Interviews',
      slug: 'system-design-primer',
      channelName: 'Gaurav Sen',
      channelUrl: 'https://youtube.com/@gkcs',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      description: 'High-level architecture design patterns: load balancing, caching, database sharding, and message queues.',
      categoryId: createdCategories['system-design'].id,
      order: 4,
      featured: true,
      visible: true,
    },
    {
      title: 'Generative AI & LLM Engineering',
      slug: 'generative-ai-engineering',
      channelName: 'CampusX',
      channelUrl: 'https://youtube.com/@campusx-official',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      description: 'Build production-ready LLM applications, retrieval-augmented generation (RAG) pipelines, and autonomous agents.',
      categoryId: createdCategories['generative-ai'].id,
      order: 5,
      featured: true,
      visible: true,
    },
  ];

  await prisma.playlist.deleteMany({});
  const createdPlaylists = {};
  for (const p of playlistsData) {
    const pl = await prisma.playlist.create({ data: p });
    createdPlaylists[p.slug] = pl;
  }

  // 6. Curated Video Lectures
  const sampleVideos = [
    {
      youtubeId: '0bHoB3568eE',
      title: 'Complete Roadmap to Master DSA in 2026',
      description: 'Step-by-step roadmap for mastering Data Structures and Algorithms with top patterns and interview strategies.',
      thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc141e97d4d?w=800&auto=format&fit=crop&q=80',
      duration: '32:40',
      views: 145000,
      isShort: false,
      channelName: 'take U forward',
      categoryId: createdCategories['dsa'].id,
      playlistId: createdPlaylists['strivers-a2z-dsa'].id,
      featured: true,
      visible: true,
      order: 1,
    },
    {
      youtubeId: 'V9PbhzZlV5U',
      title: 'Full Stack Web Development with Next.js 14, Tailwind & Prisma',
      description: 'Hands-on architectural guide to building a modern production web application from scratch.',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
      duration: '45:12',
      views: 92000,
      isShort: false,
      channelName: 'CodeHelp',
      categoryId: createdCategories['web-development'].id,
      playlistId: createdPlaylists['fullstack-nextjs-masterclass'].id,
      featured: true,
      visible: true,
      order: 2,
    },
    {
      youtubeId: 'k1rn7v3pZc4',
      title: 'How Backend Systems Scale to 1 Million Concurrent Users',
      description: 'Deep dive into load balancing, horizontal scaling, caching strategies with Redis, and message queues.',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
      duration: '28:15',
      views: 68000,
      isShort: false,
      channelName: 'Hussein Nasser',
      categoryId: createdCategories['backend-engineering'].id,
      playlistId: createdPlaylists['backend-distributed-systems'].id,
      featured: true,
      visible: true,
      order: 3,
    },
    {
      youtubeId: 'M7XhD7v1v4Q',
      title: 'System Design Primer: Designing URL Shortener (TinyURL)',
      description: 'The quintessential system design interview problem: hashing, database schema, rate limiting, and analytics.',
      thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
      duration: '22:30',
      views: 115000,
      isShort: false,
      channelName: 'Gaurav Sen',
      categoryId: createdCategories['system-design'].id,
      playlistId: createdPlaylists['system-design-primer'].id,
      featured: false,
      visible: true,
      order: 4,
    },
    {
      youtubeId: 'L8gP9n6tV4c',
      title: 'Building Autonomous AI Agents with LangChain & Claude',
      description: 'Step-by-step masterclass on tool calling, agent memory, and reasoning loops with modern LLMs.',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80',
      duration: '35:48',
      views: 48000,
      isShort: false,
      channelName: 'CampusX',
      categoryId: createdCategories['generative-ai'].id,
      playlistId: createdPlaylists['generative-ai-engineering'].id,
      featured: false,
      visible: true,
      order: 5,
    },
  ];

  await prisma.video.deleteMany({});
  const createdVideos = [];
  for (const v of sampleVideos) {
    const vid = await prisma.video.create({ data: v });
    createdVideos.push(vid);
  }

  // 7. Recommended Developer Tools
  const toolsData = [
    {
      name: 'VS Code',
      logo: 'https://icons.duckduckgo.com/ip3/code.visualstudio.com.ico',
      oneLiner: 'The industry-standard extensible code editor for modern software engineering.',
      description: 'Unmatched ecosystem of extensions, intelligent autocompletion, integrated terminal, and debugging workflows.',
      tag: 'Editor',
      url: 'https://code.visualstudio.com',
      showOnHome: true,
      order: 1,
    },
    {
      name: 'Postman',
      logo: 'https://icons.duckduckgo.com/ip3/postman.com.ico',
      oneLiner: 'Build, inspect, test, and document REST and GraphQL APIs seamlessly.',
      description: 'The leading API collaboration platform for backend engineers to automate tests, simulate requests, and debug endpoints.',
      tag: 'API Testing',
      url: 'https://www.postman.com',
      showOnHome: true,
      order: 2,
    },
    {
      name: 'Docker',
      logo: 'https://icons.duckduckgo.com/ip3/docker.com.ico',
      oneLiner: 'Containerize applications for reproducible dev and cloud deployment.',
      description: 'Isolate dependencies, spin up databases instantly, and ensure code runs identically across dev, test, and production.',
      tag: 'DevOps',
      url: 'https://www.docker.com',
      showOnHome: true,
      order: 3,
    },
    {
      name: 'GitHub',
      logo: 'https://icons.duckduckgo.com/ip3/github.com.ico',
      oneLiner: 'Version control, open-source collaboration, and automated CI/CD actions.',
      description: 'Host repositories, collaborate on open source projects, track issues, and deploy automatically with GitHub Actions.',
      tag: 'VCS & CI/CD',
      url: 'https://github.com',
      showOnHome: true,
      order: 4,
    },
    {
      name: 'Neon & Supabase',
      logo: 'https://icons.duckduckgo.com/ip3/neon.tech.ico',
      oneLiner: 'Serverless PostgreSQL databases built for modern cloud and serverless apps.',
      description: 'Instant branching, autoscaling, connection pooling, and seamless integration with Prisma and Next.js.',
      tag: 'Database',
      url: 'https://neon.tech',
      showOnHome: true,
      order: 5,
    },
  ];

  await prisma.tool.deleteMany({});
  for (const t of toolsData) {
    await prisma.tool.create({ data: t });
  }

  // 8. Developer Gear
  const gearData = [
    {
      name: 'Keychron Q1 Pro Mechanical Keyboard',
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80',
      description: 'Full aluminum body with tactile switches for satisfying, fatigue-free coding sessions.',
      price: '₹14,999',
      url: 'https://keychron.in',
      category: 'Workstation',
      order: 1,
    },
    {
      name: 'Dell UltraSharp 27" 4K Monitor',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      description: 'Crisp text rendering and expansive screen real estate for multi-window code editors and docs.',
      price: '₹42,990',
      url: 'https://www.dell.com',
      category: 'Workstation',
      order: 2,
    },
    {
      name: 'Sony WH-1000XM5 Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      description: 'Industry-leading active noise cancellation for staying locked in deep flow state while programming.',
      price: '₹26,990',
      url: 'https://www.sony.co.in',
      category: 'Audio',
      order: 3,
    },
    {
      name: 'Apple MacBook Pro M3 Max',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      description: 'Blazing-fast local builds, instantaneous Docker startup, and all-day battery efficiency.',
      price: '₹2,49,900',
      url: 'https://www.apple.com/in/macbook-pro/',
      category: 'Workstation',
      order: 4,
    },
  ];

  await prisma.gearItem.deleteMany({});
  for (const g of gearData) {
    await prisma.gearItem.create({ data: g });
  }

  // 9. Free Student Resources
  const resourcesData = [
    {
      title: 'DSA Pattern Master Sheet & Interview Guide',
      description: 'Curated 75 essential algorithmic problem patterns (Sliding Window, Two Pointers, DFS/BFS, DP).',
      categoryId: createdCategories['dsa'].id,
      videoId: createdVideos[0].id,
      promptText: `DSA Pattern Checklist:
1. Two Pointers & Sliding Window: Trapping Rain Water, Longest Substring Without Repeating Characters.
2. Fast & Slow Pointers: Linked List Cycle Detection, Happy Number.
3. Trees & Graphs: Level-order traversal, Number of Islands, Topological Sort.
4. Dynamic Programming: 0/1 Knapsack, Coin Change, Longest Common Subsequence.`,
      fileUrl: '',
      locked: true,
      order: 1,
    },
    {
      title: 'System Design Interview Architectural Blueprint',
      description: 'Comprehensive high-level & low-level architecture template with capacity planning formulas.',
      categoryId: createdCategories['system-design'].id,
      videoId: createdVideos[3].id,
      promptText: `System Design Template:
1. Requirement Gathering: Functional vs Non-Functional (Throughput, Latency, Availability).
2. Capacity Estimation: QPS, Daily Storage, Bandwidth calculations.
3. High Level Architecture: Client -> CDN -> Load Balancer -> Microservices -> Cache -> DB Cluster.
4. Bottleneck Analysis: Single points of failure, partition tolerance, and replication lag.`,
      fileUrl: '',
      locked: true,
      order: 2,
    },
    {
      title: 'Full Stack Next.js Production Starter Template',
      description: 'Production-ready starter boilerplate with NextAuth, Prisma, Tailwind CSS, and TypeScript.',
      categoryId: createdCategories['web-development'].id,
      videoId: createdVideos[1].id,
      promptText: `Stack Overview:
- Next.js 14 App Router with Server Actions & API Routes
- Authentication via NextAuth.js
- Prisma ORM configured for PostgreSQL / SQLite
- Tailwind CSS with responsive layout components
- Full TypeScript type safety and error boundaries`,
      fileUrl: '',
      locked: true,
      order: 3,
    },
    {
      title: 'CS Fundamentals Quick Revision Notes',
      description: 'High-signal summary of Operating Systems, DBMS (ACID, Indexes), and Computer Networks (OSI, TCP/IP).',
      categoryId: createdCategories['cs-fundamentals'].id,
      videoId: createdVideos[2].id,
      promptText: `CS Fundamentals Core Notes:
1. Operating Systems: Process vs Thread, Deadlock Conditions, Virtual Memory & Paging.
2. DBMS: ACID Properties, B-Tree Indexes vs Hash Indexes, Normalization (1NF to 3NF).
3. Computer Networks: TCP 3-way handshake, HTTP vs HTTP/2 vs HTTP/3, DNS Resolution flow.`,
      fileUrl: '',
      locked: true,
      order: 4,
    },
    {
      title: 'Git & GitHub Pro Workflow Cheat Sheet',
      description: 'Clean commit conventions, interactive rebasing, branch management, and open-source contribution checklist.',
      categoryId: createdCategories['web-development'].id,
      videoId: createdVideos[1].id,
      promptText: `Git Workflow Guidelines:
- Conventional Commits: feat:, fix:, chore:, docs:, refactor:
- Branching: main, dev, feature/<name>
- Rebasing cleanly without merge conflict clutter: git rebase -i HEAD~3
- Squashing commits before PR merge`,
      fileUrl: '',
      locked: true,
      order: 5,
    },
  ];

  await prisma.resourceItem.deleteMany({});
  for (const r of resourcesData) {
    await prisma.resourceItem.create({ data: r });
  }

  // 10. Reels / Shorts
  const reelsData = [
    {
      title: '3 Golden Rules for Mastering DSA in 2026',
      description: 'Focus on problem-solving patterns instead of memorizing hundreds of questions.',
      url: 'https://youtube.com',
      cover: 'https://images.unsplash.com/photo-1516116211227-bbc141e97d4d?w=600&auto=format&fit=crop&q=80',
      order: 1,
    },
    {
      title: 'How Systems Handle 1 Million Requests Per Second',
      description: 'Behind the scenes: CDN edge caching, connection pooling, and read replicas.',
      url: 'https://youtube.com',
      cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
      order: 2,
    },
  ];

  await prisma.reel.deleteMany({});
  for (const rel of reelsData) {
    await prisma.reel.create({ data: rel });
  }

  // 11. Home Page Sections
  const homeSections = [
    {
      page: 'home',
      type: 'hero',
      order: 1,
      visible: true,
      data: JSON.stringify({
        h1: 'Learn Tech the simplest way possible',
        subtext: 'Curated roadmaps, step-by-step lectures, and practical project resources for students and self-taught developers. Stop getting lost in tutorial hell.',
        primaryBtn: 'Explore Domains',
        primaryUrl: '/#domains',
        secondaryBtn: 'Student Resources',
        secondaryUrl: '/resources',
        badgeText: 'Curated Tech Learning Platform for Students',
      }),
    },
    {
      page: 'home',
      type: 'categories',
      order: 2,
      visible: true,
      data: JSON.stringify({
        heading: 'Explore Learning Domains',
        subheading: 'Structured paths designed to take you from foundational concepts to job-ready engineering.',
      }),
    },
    {
      page: 'home',
      type: 'tutorials',
      order: 3,
      visible: true,
      data: JSON.stringify({
        heading: 'Curated Lectures & Courses',
        linkText: 'Browse all courses',
        linkUrl: '/watch-tutorials',
        count: 5,
        source: 'featured',
      }),
    },
    {
      page: 'home',
      type: 'tools',
      order: 4,
      visible: true,
      data: JSON.stringify({
        heading: 'Recommended Developer Tools',
        subheading: 'Essential software, platforms, and developer utilities battle-tested by modern engineers.',
        bottomLinkText: 'See all recommended tools',
        bottomLinkUrl: '/recommended-tools',
      }),
    },
    {
      page: 'home',
      type: 'banner',
      order: 5,
      visible: true,
      data: JSON.stringify({
        heading: 'Free student resources for every track.',
        subtext: 'Get instant access to curated DSA cheat sheets, system design templates, and open-source project guides.',
        buttonText: 'Visit Resources',
        buttonUrl: '/resources',
      }),
    },
    {
      page: 'home',
      type: 'reels',
      order: 6,
      visible: true,
      data: JSON.stringify({
        heading: 'Shorts & Insights',
        blurb: 'Bite-sized engineering tips, algorithmic breakdowns, and tech career advice.',
        buttonText: 'Watch on YouTube',
        buttonUrl: 'https://youtube.com',
      }),
    },
    {
      page: 'home',
      type: 'about',
      order: 7,
      visible: true,
      data: JSON.stringify({
        heading: 'About',
        title: 'Zenvora',
        paragraph1: 'Zenvora is built to simplify the tech learning journey for students, career switchers, and developers worldwide.',
        paragraph2: 'We cut through tutorial hell with structured domain roadmaps, hands-on masterclasses, and curated developer resources.',
        primaryBtn: 'Explore Domains',
        primaryUrl: '/#domains',
        secondaryBtn: 'Student Resources',
        secondaryUrl: '/resources',
        collabHeading: 'Collaborations & Opportunities',
        collabSubtext: 'Interested in partnering with Zenvora or listing student opportunities?',
        email: 'hello@zenvora.com',
      }),
    },
    {
      page: 'home',
      type: 'cta',
      order: 8,
      visible: true,
      data: JSON.stringify({
        heading: 'Start Learning Tech the Simplest Way',
        subtext: 'Join students and developers mastering Web Dev, Backend, AI/ML, System Design, and DSA with curated roadmaps.',
        buttonText: 'Explore Tracks',
        buttonUrl: '/#domains',
        telegramText: 'Explore student developer resources →',
        telegramUrl: '/resources',
      }),
    },
    {
      page: 'home',
      type: 'footer',
      order: 9,
      visible: true,
      data: JSON.stringify({
        brandName: 'Zenvora',
        tagline: 'Learn tech the simplest way possible.',
      }),
    },
  ];

  await prisma.section.deleteMany({});
  for (const s of homeSections) {
    await prisma.section.create({ data: s });
  }

  // 12. Legal Pages
  const legalPages = [
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      metaDescription: 'Privacy policy for Zenvora. Explains data collection for free educational resources.',
      content: `## Privacy Policy

**Last updated:** October 26, 2026

Zenvora ("we", "our", or "us") respects your privacy. This Privacy Policy explains how personal data is collected and protected when you visit **zenvora.com** and interact with our resources, tracks, and student forms.

### 1. Information We Collect
We collect personal information that you voluntarily provide to us when you:
- Fill out the **Unlock Free Resources** form (your name, email address, WhatsApp/phone number, and learning track interests).
- Fill out the **Collaborations** enquiry form (your name, email address, organization/club, and message).
- Contact us via email or direct messaging.

### 2. How We Use Your Information
We use your information strictly for educational and legitimate platform purposes:
- To immediately grant access to free DSA sheets, system design templates, and roadmap resources.
- To notify you about new curated video lectures, student hackathons, and engineering guides.
- We never sell or share your personal data with third-party advertisers.

### 3. Cookies
We use minimal, secure browser cookies:
- \`resources_unlocked=1\`: A secure cookie set for 12 months after completing the unlock form, so you never have to re-enter your information.
- Essential session cookies for authenticated admin access.

### 4. Contact
For questions regarding your data or to request data removal, contact **hello@zenvora.com**.`,
    },
    {
      slug: 'terms-and-conditions',
      title: 'Terms and Conditions',
      metaDescription: 'Terms and conditions governing the use of Zenvora learning tracks and educational resources.',
      content: `## Terms and Conditions

**Last updated:** October 26, 2026

Welcome to Zenvora. By accessing or using this website, you agree to be bound by these Terms and Conditions.

### 1. Intellectual Property & Fair Use
All original learning roadmaps, curated guides, custom code snippets, and platform layouts on this website are the property of Zenvora, unless otherwise attributed. You are welcome to use our resources and templates for your personal, academic, or professional learning.

### 2. Educational Purpose
All tutorials, roadmaps, and content on Zenvora are provided strictly for educational purposes to help students and developers master technology skills.

### 3. Contact
If you have any questions about these Terms, reach out to us at **hello@zenvora.com**.`,
    },
  ];

  await prisma.page.deleteMany({});
  for (const p of legalPages) {
    await prisma.page.create({ data: p });
  }

  console.log('✅ Zenvora database seeded successfully with tech learning tracks, domains, and lectures!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
