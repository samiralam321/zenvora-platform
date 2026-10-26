const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Zenvora database...');

  // 1. Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'samir@zenvora.com';
  const rawPassword = process.env.ADMIN_PASSWORD || 'ChangeMeOnFirstLogin';
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
    ogImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
    youtubeUrl: 'https://youtube.com',
    youtubeChannelId: '',
    instagramUrl: 'https://instagram.com',
    instagramHandle: '@zenvora',
    telegramUrl: '',
    whatsappNumber: '',
    businessEmail: 'hello@zenvora.com',
    agencyName: 'Zenvora',
    footerText: 'Empowering students and self-taught developers to learn tech the simplest way possible.',
    affiliateDisclosureEnabled: true,
    affiliateDisclosureText: 'Some links on this site are affiliate links. If you make a purchase through them, I may earn a small commission at no additional cost to you. I only recommend tools I personally use and test.',
    scrollToTopEnabled: true,
    unlockMode: 'required', // 'required', 'optional', 'public'
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
    { area: 'header', label: 'Watch Tutorials', url: '/watch-tutorials', order: 1, visible: true, isButton: false },
    { area: 'header', label: 'Recommended Tools', url: '/recommended-tools', order: 2, visible: true, isButton: false },
    { area: 'header', label: 'My Gear', url: '/my-gear', order: 3, visible: true, isButton: false },
    { area: 'header', label: 'Resources', url: '/resources', order: 4, visible: true, isButton: false },
    { area: 'header', label: 'Instagram', url: 'https://www.instagram.com/growth_sahayta', order: 5, visible: true, isButton: false },
    { area: 'header', label: 'Free resources', url: '/resources', order: 6, visible: true, isButton: true },
  ];

  await prisma.navItem.deleteMany({});
  for (const item of navItems) {
    await prisma.navItem.create({ data: item });
  }

  // 4. Categories
  const categoriesData = [
    {
      name: 'Meta Ads',
      slug: 'meta-ads',
      icon: 'Target',
      description: 'Proven Facebook and Instagram advertising frameworks for high ROAS and scalable acquisition.',
      link: '/watch-tutorials?category=meta-ads',
      order: 1,
    },
    {
      name: 'Andromeda Ads 2026',
      slug: 'andromeda-2026',
      icon: 'Sparkles',
      description: 'Cutting-edge algorithmic bidding, broad targeting, and AI-driven creative architectures.',
      link: '/watch-tutorials?category=andromeda-2026',
      order: 2,
    },
    {
      name: 'AI Agents & Automation',
      slug: 'ai-agents',
      icon: 'Bot',
      description: 'Building custom marketing workflows, automated creative iteration, and conversational agents.',
      link: '/watch-tutorials?category=ai-agents',
      order: 3,
    },
    {
      name: 'Agency & Client Work',
      slug: 'agency-work',
      icon: 'Briefcase',
      description: 'Scaling Growth Sahayta, managing client ad spend, and landing high-ticket retainer contracts.',
      link: 'https://www.instagram.com/growth_sahayta',
      order: 4,
    },
  ];

  await prisma.category.deleteMany({});
  const createdCategories = {};
  for (const cat of categoriesData) {
    const c = await prisma.category.create({ data: cat });
    createdCategories[cat.slug] = c;
  }

  // 5. Seed Videos
  const sampleVideos = [
    {
      youtubeId: 'bX7jP-1_l_E',
      title: 'Meta Ads in 2026: Complete Step-by-Step Blueprint for Beginners',
      description: 'Everything you need to set up, test, and scale profitable Facebook and Instagram ad campaigns from zero.',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      duration: '24:18',
      views: 14200,
      isShort: false,
      categoryId: createdCategories['meta-ads'].id,
      featured: true,
      visible: true,
      order: 1,
    },
    {
      youtubeId: '3JZ_D3ELwOQ',
      title: 'Andromeda Algorithm Explained: How Meta Bids in 2026',
      description: 'Forget narrow audience targeting. Learn how AI broad bidding and dynamic creative clusters drive 5x ROAS.',
      thumbnail: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=800&auto=format&fit=crop&q=80',
      duration: '18:45',
      views: 9800,
      isShort: false,
      categoryId: createdCategories['andromeda-2026'].id,
      featured: true,
      visible: true,
      order: 2,
    },
    {
      youtubeId: 'kJQP7kiw5Fk',
      title: 'How I Built an AI Marketing Agent to Write 100 Ad Copies',
      description: 'Step-by-step walkthrough creating an autonomous marketing agent using Claude and custom prompt workflows.',
      thumbnail: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80',
      duration: '15:20',
      views: 7400,
      isShort: false,
      categoryId: createdCategories['ai-agents'].id,
      featured: true,
      visible: true,
      order: 3,
    },
    {
      youtubeId: 'fJ9rUzIMcZQ',
      title: 'Scaling an E-Commerce Brand to $50k/Month with Advantage+ Campaigns',
      description: 'Real client case study breakdown from Growth Sahayta: creative angles, budget scaling rules, and attribution.',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      duration: '21:05',
      views: 11200,
      isShort: false,
      categoryId: createdCategories['agency-work'].id,
      featured: false,
      visible: true,
      order: 4,
    },
    {
      youtubeId: 'C0DPdy98e4c',
      title: 'Google Ads vs Meta Ads: Which Channel Should You Launch First?',
      description: 'Search intent versus algorithmic push: an objective breakdown for founders and local businesses.',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      duration: '13:50',
      views: 6500,
      isShort: false,
      categoryId: createdCategories['meta-ads'].id,
      featured: false,
      visible: true,
      order: 5,
    },
    {
      youtubeId: 'sBws8MSXN7A',
      title: '3 UGC Ad Hooks That Never Stop Converting',
      description: 'Stop using boring openers. Use these 3 proven hook templates in your next short-form video ad.',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      duration: '0:58',
      views: 28400,
      isShort: true,
      categoryId: createdCategories['meta-ads'].id,
      featured: false,
      visible: true,
      order: 6,
    },
  ];

  await prisma.video.deleteMany({});
  const createdVideos = [];
  for (const v of sampleVideos) {
    const vid = await prisma.video.create({ data: v });
    createdVideos.push(vid);
  }

  // 6. Tools
  const toolsData = [
    {
      name: 'Meta Ads Library',
      logo: 'https://icons.duckduckgo.com/ip3/facebook.com.ico',
      oneLiner: 'Analyze high-performing competitor creative hooks and active campaigns.',
      description: 'The definitive free database for inspecting active ad sets, creative formats, copy variants, and landing page angles across any brand or industry.',
      tag: 'Research',
      url: 'https://www.facebook.com/ads/library/',
      showOnHome: true,
      order: 1,
    },
    {
      name: 'Triple Whale',
      logo: 'https://icons.duckduckgo.com/ip3/triplewhale.com.ico',
      oneLiner: 'First-party attribution, pixel tracking, and true blended ROAS dashboard.',
      description: 'The golden standard for multi-channel e-commerce media buyers. Accurately tracks buyer journeys and eliminates attribution blindspots.',
      tag: 'Attribution',
      url: 'https://www.triplewhale.com',
      showOnHome: true,
      order: 2,
    },
    {
      name: 'ElevenLabs',
      logo: 'https://icons.duckduckgo.com/ip3/elevenlabs.io.ico',
      oneLiner: 'Generate hyper-realistic voiceovers for UGC and video sales letters.',
      description: 'The most realistic AI voice generator for fast-paced video ads, multilingual customer acquisition, and dynamic audio scripts.',
      tag: 'AI Audio',
      url: 'https://elevenlabs.io',
      showOnHome: true,
      order: 3,
    },
    {
      name: 'Canva Pro',
      logo: 'https://icons.duckduckgo.com/ip3/canva.com.ico',
      oneLiner: 'Rapidly design scroll-stopping statics, hook cards, and story creatives.',
      description: 'The best agile tool for creating rapid visual iterations, high-contrast typography stickers, and branded thumbnails without Photoshop bloat.',
      tag: 'Design',
      url: 'https://www.canva.com',
      showOnHome: true,
      order: 4,
    },
    {
      name: 'Notion',
      logo: 'https://icons.duckduckgo.com/ip3/notion.so.ico',
      oneLiner: 'Organize creative pipelines, client briefs, and campaign testing boards.',
      description: 'The ultimate workspace for media buying teams to track hypothesis logs, weekly creative drops, budget pacing, and client roadmaps.',
      tag: 'Workflow',
      url: 'https://www.notion.so',
      showOnHome: true,
      order: 5,
    },
  ];

  await prisma.tool.deleteMany({});
  for (const t of toolsData) {
    await prisma.tool.create({ data: t });
  }

  // 7. Gear Items
  const gearData = [
    {
      name: 'Shure SM7B Vocal Microphone',
      image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80',
      description: 'Legendary broadcast vocal microphone delivering warm, crystal-clear tone and shielding against background fan or AC hum.',
      price: '₹34,999',
      url: 'https://www.amazon.in/s?k=Shure+SM7B',
      category: 'Audio',
      order: 1,
    },
    {
      name: 'Sony Alpha a6700 Camera',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
      description: 'Ultra-fast AI-powered subject eye autofocus, cinematic 10-bit color science, and 4K 60fps recording for YouTube masterclasses.',
      price: '₹1,24,990',
      url: 'https://www.amazon.in/s?k=Sony+a6700',
      category: 'Camera',
      order: 2,
    },
    {
      name: 'Apple MacBook Pro M3 Max',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
      description: 'Smooth timeline scrubbing, instantaneous 4K multi-layer exports in DaVinci Resolve, and all-day battery efficiency.',
      price: '₹2,49,900',
      url: 'https://www.apple.com/in/macbook-pro/',
      category: 'Workstation',
      order: 3,
    },
    {
      name: 'Godox SL60W Studio Continuous Light',
      image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&auto=format&fit=crop&q=80',
      description: 'Soft 5600K daylight-balanced illumination paired with a 90cm octabox for an even, cinematic wrap across the face.',
      price: '₹11,499',
      url: 'https://www.amazon.in/s?k=Godox+SL60W',
      category: 'Lighting',
      order: 4,
    },
  ];

  await prisma.gearItem.deleteMany({});
  for (const g of gearData) {
    await prisma.gearItem.create({ data: g });
  }

  // 8. Resource Items
  const resourcesData = [
    {
      title: 'Meta Ad Hook Master Generator (AI Prompt)',
      description: 'Generate 20 scroll-stopping video hooks, emotional pain-point openers, and curiosity loops tailored to any niche.',
      categoryId: createdCategories['meta-ads'].id,
      videoId: createdVideos[0].id,
      promptText: `Act as a world-class direct-response copywriter who has spent over $10M on Meta Ads.
I am selling [INSERT PRODUCT/SERVICE] to [INSERT TARGET AUDIENCE].
The primary problem they face is [INSERT MAIN PAIN POINT].
The unique solution I provide is [INSERT CORE BENEFIT].

Generate 20 high-converting video ad hooks across these 4 specific categories:
1. Negative Contradiction ("Stop doing X if you want Y")
2. Secret / Curiosity Gap ("The real reason your ads are failing...")
3. Call-out / Direct Identifier ("Attention e-commerce brand owners...")
4. Visual / Physical Demo ("Watch what happens when we tested this...")

For each hook, explain the psychological trigger and the exact on-screen visual pairing.`,
      fileUrl: '',
      locked: true,
      order: 1,
    },
    {
      title: 'Andromeda 2026 Campaign Architecture Checklist',
      description: 'Complete campaign launch blueprint: broad targeting settings, dynamic creative groupings, and AI budget pacing.',
      categoryId: createdCategories['andromeda-2026'].id,
      videoId: createdVideos[1].id,
      promptText: `System Prompt for Campaign Audit:
Analyze my existing Meta Ads campaign configuration against Andromeda 2026 algorithmic principles:
- Account Structure: Consolidate to maximum 2-3 active campaigns.
- Audience Setup: Broad targeting (Age, Gender, Geo only) with zero interest/lookalike fragmentation.
- Creative Diversity: Minimum 3 distinct angles per DCT (Dynamic Creative Test).
- Attribution Window: 7-day click / 1-day view with CAPI (Conversions API) deduplication.`,
      fileUrl: '',
      locked: true,
      order: 2,
    },
    {
      title: 'AI Marketing Copywriter Agent Persona',
      description: 'Custom system prompt to turn Claude or ChatGPT into a ruthless Meta Ad copy tester with strict character counts.',
      categoryId: createdCategories['ai-agents'].id,
      videoId: createdVideos[2].id,
      promptText: `You are AD-GENIUS-2026, an autonomous senior copywriter.
Rules:
1. Never use corporate jargon ("revolutionize", "game-changing", "unleash").
2. Write in conversational 6th-grade reading level.
3. Keep primary text punchy: Hook (under 80 chars), Body (1-3 crisp bullet points), Single call to action.
4. Output 5 primary text variants and 5 headline variants under 45 characters.`,
      fileUrl: '',
      locked: true,
      order: 3,
    },
    {
      title: 'High-ROAS Retargeting & Exclusion Matrix',
      description: 'Setup guidelines to prevent wasting spend on existing purchasers and maximize cold acquisition volume.',
      categoryId: createdCategories['meta-ads'].id,
      videoId: createdVideos[0].id,
      promptText: `Exclusion Matrix Guidelines:
1. Exclude 30-day Purchasers from all Prospecting / Top-of-Funnel sets.
2. Build 180-day Customer List audience and apply across Advantage+ Shopping Campaigns.
3. For retargeting, limit budget to maximum 15% of total account spend.`,
      fileUrl: '',
      locked: true,
      order: 4,
    },
    {
      title: 'Growth Sahayta Client Onboarding & Ad Audit Form',
      description: 'The exact 15-point diagnostic sheet we use before taking over any ad account.',
      categoryId: createdCategories['agency-work'].id,
      videoId: createdVideos[3].id,
      promptText: `Audit Framework:
1. Pixel & CAPI Event Match Quality score (must exceed 8.0/10).
2. Creative fatigue rate: % of spend concentrated in top 2 ads.
3. Cost per Outbound Click vs Cost per Unique Add to Cart ratio.
4. Landing page speed and mobile checkout drop-off rate.`,
      fileUrl: '',
      locked: true,
      order: 5,
    },
    {
      title: '3-Second Short-Form Hook Formulas',
      description: '10 viral short-form script templates tested across Reels and Shorts with high watch-time retention.',
      categoryId: createdCategories['meta-ads'].id,
      videoId: createdVideos[5].id,
      promptText: `Hook 1: "If you're still doing [Common Practice] in 2026, please stop."
Hook 2: "This 2-minute setting changed our cost per lead from ₹450 to ₹120."
Hook 3: "Here is what no marketing agency will tell you about broad targeting."`,
      fileUrl: '',
      locked: true,
      order: 6,
    },
  ];

  await prisma.resourceItem.deleteMany({});
  for (const r of resourcesData) {
    await prisma.resourceItem.create({ data: r });
  }

  // 9. Reels
  const reelsData = [
    {
      title: 'Why 90% of Meta Ad Budgets Are Wasted in 2026',
      description: 'The #1 mistake media buyers make with audience overlap and high CPMs.',
      url: 'https://www.instagram.com/growth_sahayta',
      cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      order: 1,
    },
    {
      title: 'The Andromeda Bidding Trick You Need To Know',
      description: 'How to structure Dynamic Creative sets so Meta auto-allocates spend to winners.',
      url: 'https://www.instagram.com/growth_sahayta',
      cover: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=600&auto=format&fit=crop&q=80',
      order: 2,
    },
  ];

  await prisma.reel.deleteMany({});
  for (const rel of reelsData) {
    await prisma.reel.create({ data: rel });
  }

  // 10. Home Sections
  const homeSections = [
    {
      page: 'home',
      type: 'hero',
      order: 1,
      visible: true,
      data: JSON.stringify({
        h1: 'Scale your business with Meta Ads, the simple way.',
        subtext: 'Beginner-friendly tutorials on Facebook and Instagram ads, marketing strategy and AI. Start with an idea and grow it into real results.',
        primaryBtn: 'Watch Tutorials',
        primaryUrl: '/watch-tutorials',
        secondaryBtn: 'Instagram',
        secondaryUrl: 'https://www.instagram.com/growth_sahayta',
        badgeText: 'New 2026 Frameworks Released',
      }),
    },
    {
      page: 'home',
      type: 'categories',
      order: 2,
      visible: true,
      data: JSON.stringify({
        heading: 'Explore Topics',
        subheading: 'Master the high-leverage skills driving modern paid media performance.',
      }),
    },
    {
      page: 'home',
      type: 'tutorials',
      order: 3,
      visible: true,
      data: JSON.stringify({
        heading: 'Latest Tutorials',
        linkText: 'See all tutorials',
        linkUrl: '/watch-tutorials',
        count: 3,
        source: 'featured', // 'latest', 'featured'
      }),
    },
    {
      page: 'home',
      type: 'tools',
      order: 4,
      visible: true,
      data: JSON.stringify({
        heading: 'Recommended Tools',
        subheading: 'The tools I use and share in my videos.',
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
        heading: 'Free prompts for every tutorial.',
        subtext: 'Get instant access to copy-paste AI ad prompts, campaign checklists, and creative testing frameworks.',
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
        heading: 'Instagram',
        blurb: 'Quick ad breakdowns, Andromeda bidding insights, and behind-the-scenes tests at Growth Sahayta.',
        buttonText: 'Follow on Instagram',
        buttonUrl: 'https://www.instagram.com/growth_sahayta',
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
        paragraph1: "Zenvora is built to simplify the tech learning journey for students, career switchers, and developers worldwide.",
        paragraph2: "We cut through tutorial hell with structured domain roadmaps, hands-on masterclasses, and curated developer resources.",
        primaryBtn: 'Explore Domains',
        primaryUrl: '/#domains',
        secondaryBtn: 'Student Resources',
        secondaryUrl: '/resources',
        collabHeading: 'Collaborations & Opportunities',
        collabSubtext: 'Interested in partnering with Zenvora or listing learning resources?',
        email: 'hello@zenvora.com',
      }),
    },
    {
      page: 'home',
      type: 'cta',
      order: 8,
      visible: true,
      data: JSON.stringify({
        heading: 'Learn Tech the Simplest Way Possible',
        subtext: 'Join students and developers mastering Web Dev, Backend, AI/ML, System Design, and DSA with curated roadmaps.',
        buttonText: 'Explore Tracks',
        buttonUrl: '/#domains',
        telegramText: 'Explore our student developer resources →',
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

  // 11. Legal Pages
  const legalPages = [
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      metaDescription: 'Privacy policy for Zenvora. Explains data collection for free resources and communications.',
      content: `## Privacy Policy

**Last updated:** October 25, 2026

Zenvora ("we", "our", or "us") respects your privacy. This Privacy Policy explains how personal data is collected, used, and disclosed when you visit **zenvora.com** and interact with our resources, tutorials, and forms.

### 1. Information We Collect
We collect personal information that you voluntarily provide to us when you:
- Fill out the **Unlock Free Resources** form (including your full name, email address, WhatsApp/phone number, and learning interests).
- Fill out the **Collaborations & Sponsorships** enquiry form (including your name, email address, phone number, company name, project budget, and message).
- Contact us via email or direct messaging.

### 2. How We Use Your Information
We use your information strictly for legitimate business purposes:
- To immediately grant access to free prompts, checklists, and templates on our Resources page.
- To send periodic educational newsletters, Meta Ads case studies, and tutorial announcements via email or WhatsApp (with clear opt-out options).
- To respond to sponsorship, agency consultation, and client work enquiries.
- To monitor and maintain the security and integrity of our website.

### 3. Cookies and Local Storage
We use lightweight, secure browser cookies:
- \`resources_unlocked=1\`: A secure cookie set for 12 months after you complete the unlock form, ensuring you never have to re-enter your information on returning visits.
- Essential session cookies for authenticated admin access.
We do not sell, rent, or trade your personal data to third parties.

### 4. Data Protection & Your Rights
You have the right to request access to the personal data we hold about you, request corrections, or request complete removal of your records from our database. To request removal, simply reach out to **hello@zenvora.com**.

### 5. Third-Party Links
Our site features links to external websites, including YouTube, GitHub, Discord, and recommended partner tools. We are not responsible for the privacy practices of external platforms.`,
    },
    {
      slug: 'terms-and-conditions',
      title: 'Terms and Conditions',
      metaDescription: 'Terms and Conditions governing the use of Zenvora learning tracks and website.',
      content: `## Terms and Conditions

**Last updated:** October 25, 2026

Welcome to Zenvora. By accessing or using this website, you agree to be bound by these Terms and Conditions.

### 1. Intellectual Property
All original educational roadmaps, curated resources, custom code snippets, and site layout designs on this website are the intellectual property of Zenvora, unless otherwise noted. You may freely use our templates and code for your personal or educational development, but you may not republish our database as a competing commercial product.

### 2. Educational Disclaimer
All tutorials, roadmaps, and recommendations provided on this website are for educational purposes.

### 3. User Conduct
When submitting forms on this website, you agree to provide authentic and accurate contact information. Any automated scraping, spam submissions, or malicious access attempts are strictly prohibited.`,
    },
    {
      slug: 'disclaimer',
      title: 'Disclaimer & Affiliate Disclosure',
      metaDescription: 'Earnings disclaimer and affiliate disclosure for Zenvora.',
      content: `## Disclaimer & Affiliate Disclosure

**Last updated:** October 25, 2026

### 1. Affiliate Disclosure
Some of the links on this website (particularly within the **Recommended Tools** and **My Gear** sections) may be affiliate links. If you click on an affiliate link and complete a purchase or sign up for a subscription, Zenvora may receive a referral commission at no additional cost to you. 

We only recommend tools, software platforms, and resources that we believe provide genuine value to students and developers.

### 2. Educational & Platform Disclaimer
Technology stacks and cloud services continuously evolve. Always test code and deploy responsibly in your environments.`,
    },
  ];

  await prisma.page.deleteMany({});
  for (const p of legalPages) {
    await prisma.page.create({ data: p });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
