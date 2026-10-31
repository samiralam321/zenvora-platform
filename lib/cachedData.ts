import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

/**
 * Cached Site Settings
 * Stays cached in memory / edge for 1 hour or until invalidated via tag 'site_settings'.
 */
export const getCachedSiteSettings = unstable_cache(
  async () => {
    try {
      const s = await prisma.setting.findUnique({
        where: { key: "site_settings" },
      });
      if (s?.value) return JSON.parse(s.value);
    } catch (e) {
      console.error("Error loading cached site settings:", e);
    }
    return {};
  },
  ["site_settings"],
  {
    revalidate: 3600,
    tags: ["site_settings"],
  }
);

/**
 * Cached Navigation Items
 * Stays cached for 1 hour or until invalidated via tag 'nav_items'.
 */
export const getCachedNavItems = unstable_cache(
  async (area: string = "header") => {
    try {
      return await prisma.navItem.findMany({
        where: { area, visible: true },
        orderBy: { order: "asc" },
      });
    } catch (e) {
      console.error("Error loading cached nav items:", e);
      return [];
    }
  },
  ["nav_items"],
  {
    revalidate: 3600,
    tags: ["nav_items"],
  }
);

/**
 * Cached Categories with Playlists
 */
export const getCachedCategoriesWithPlaylists = unstable_cache(
  async () => {
    try {
      const [categories, playlists] = await Promise.all([
        prisma.category.findMany({
          orderBy: { order: "asc" },
        }),
        prisma.playlist.findMany({
          where: { visible: true },
          include: {
            category: true,
            videos: { where: { visible: true }, orderBy: { order: "asc" } },
          },
          orderBy: { order: "asc" },
        }),
      ]);
      return { categories, playlists };
    } catch (e) {
      console.error("Error loading cached categories and playlists:", e);
      return { categories: [], playlists: [] };
    }
  },
  ["categories_playlists"],
  {
    revalidate: 3600,
    tags: ["categories", "playlists"],
  }
);

/**
 * Cached Videos for Tutorials Page
 */
export const getCachedVideos = unstable_cache(
  async () => {
    try {
      return await prisma.video.findMany({
        where: { visible: true },
        include: { category: true, playlist: true },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { publishedAt: "desc" }],
      });
    } catch (e) {
      console.error("Error loading cached videos:", e);
      return [];
    }
  },
  ["tutorial_videos"],
  {
    revalidate: 3600,
    tags: ["videos", "tutorials"],
  }
);

/**
 * Cached Recommended Tools
 */
export const getCachedTools = unstable_cache(
  async () => {
    try {
      return await prisma.tool.findMany({
        orderBy: { order: "asc" },
      });
    } catch (e) {
      console.error("Error loading cached tools:", e);
      return [];
    }
  },
  ["recommended_tools"],
  {
    revalidate: 3600,
    tags: ["tools"],
  }
);

/**
 * Cached Published Opportunities
 */
export const getCachedOpportunities = unstable_cache(
  async () => {
    try {
      return await prisma.opportunity.findMany({
        where: { published: true },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
      });
    } catch (e) {
      console.error("Error loading cached opportunities:", e);
      return [];
    }
  },
  ["published_opportunities"],
  {
    revalidate: 3600,
    tags: ["opportunities"],
  }
);

/**
 * Cached Notes Domains
 */
export const getCachedNotesDomains = unstable_cache(
  async () => {
    try {
      let dbDomains = await prisma.notesDomain.findMany({
        where: { isPublished: true },
        orderBy: { displayOrder: "asc" },
        include: { _count: { select: { notes: { where: { status: "published" } } } } },
      });

      if (dbDomains.length < 10) {
        const { NOTES_DOMAINS } = await import("@/lib/notesData");
        for (let i = 0; i < NOTES_DOMAINS.length; i++) {
          const d = NOTES_DOMAINS[i];
          await prisma.notesDomain.upsert({
            where: { slug: d.slug },
            update: { displayOrder: i, iconName: d.iconName },
            create: {
              name: d.name,
              slug: d.slug,
              description: d.description,
              iconName: d.iconName,
              accentColor: d.accentColor,
              pastelBg: d.pastelBg,
              pastelBorder: d.pastelBorder,
              badgeBg: d.badgeBg,
              badgeText: d.badgeText,
              displayOrder: i,
              isPublished: true,
            },
          });
        }
        dbDomains = await prisma.notesDomain.findMany({
          where: { isPublished: true },
          orderBy: { displayOrder: "asc" },
          include: { _count: { select: { notes: { where: { status: "published" } } } } },
        });
      }

      return dbDomains;
    } catch (e) {
      console.error("Error loading cached notes domains:", e);
      return [];
    }
  },
  ["notes_domains"],
  {
    revalidate: 3600,
    tags: ["notes_domains"],
  }
);
