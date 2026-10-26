import prisma from "@/lib/prisma";

export interface YouTubePreviewData {
  youtubeId: string;
  title: string;
  authorName?: string;
  thumbnail: string;
  description?: string;
  duration?: string;
  views?: number;
  publishedAt?: string;
  isShort: boolean;
  suggestedCategorySlug?: string;
}

/**
 * Extracts the 11-character YouTube video ID from various URL formats or raw ID.
 */
export function extractYouTubeId(input: string): { id: string | null; isShortUrl: boolean } {
  if (!input) return { id: null, isShortUrl: false };
  const trimmed = input.trim();

  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { id: trimmed, isShortUrl: false };
  }

  const isShortUrl = trimmed.includes("/shorts/");

  // Match standard patterns
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);

  return {
    id: match ? match[1] : null,
    isShortUrl,
  };
}

/**
 * Extracts YouTube Playlist ID (e.g. from ?list=PL... or raw ID).
 */
export function extractPlaylistId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  if (/^(?:PL|RD|UU|FL)[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Formats ISO 8601 duration (e.g. PT4M13S) into standard mm:ss or hh:mm:ss
 */
export function parseIsoDuration(durationStr: string): { formatted: string; totalSeconds: number } {
  if (!durationStr) return { formatted: "0:00", totalSeconds: 0 };
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return { formatted: "0:00", totalSeconds: 0 };

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  if (hours > 0) {
    return {
      formatted: `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      totalSeconds,
    };
  }
  return {
    formatted: `${minutes}:${seconds.toString().padStart(2, "0")}`,
    totalSeconds,
  };
}

/**
 * Verifies and returns the highest resolution valid thumbnail URL for a video ID.
 */
export async function getBestThumbnail(youtubeId: string): Promise<string> {
  const maxRes = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  try {
    const res = await fetch(maxRes, { method: "HEAD", next: { revalidate: 3600 } });
    if (res.ok) {
      return maxRes;
    }
  } catch (err) {
    // fallback
  }

  const hqRes = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  return hqRes;
}

/**
 * Suggests a domain category slug based on video title keywords.
 */
export function suggestCategoryFromTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("genai") || t.includes("generative") || t.includes("rag") || t.includes("langchain") || t.includes("prompt") || t.includes("agent") || t.includes("claude") || t.includes("gpt")) {
    return "gen-ai";
  }
  if (t.includes("ai") || t.includes("ml") || t.includes("machine learning") || t.includes("deep learning") || t.includes("pytorch") || t.includes("numpy") || t.includes("pandas") || t.includes("scikit")) {
    return "ai-ml";
  }
  if (t.includes("fullstack") || t.includes("full stack") || t.includes("next.js") || t.includes("nextjs") || t.includes("auth") || t.includes("prisma") || t.includes("mern")) {
    return "full-stack";
  }
  if (t.includes("backend") || t.includes("node") || t.includes("express") || t.includes("golang") || t.includes("go") || t.includes("sql") || t.includes("postgres") || t.includes("mongo") || t.includes("database") || t.includes("api") || t.includes("system design")) {
    return "backend-dev";
  }
  return "web-dev";
}

/**
 * Fetches single video metadata via oEmbed, YouTube API v3 (if key present), and fallback thumbnail cascade.
 */
export async function fetchVideoDetails(input: string): Promise<YouTubePreviewData> {
  const { id: youtubeId, isShortUrl } = extractYouTubeId(input);
  if (!youtubeId) {
    throw new Error("Invalid YouTube URL or ID provided.");
  }

  let title = "YouTube Video";
  let authorName = "Zenvora Creator";
  let thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  let description = "";
  let duration = isShortUrl ? "0:45" : "15:00";
  let views = 0;
  let publishedAt = new Date().toISOString();
  let isShort = isShortUrl;

  // 1. Try oEmbed (no key needed)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
    const res = await fetch(oembedUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.title) title = data.title;
      if (data.author_name) authorName = data.author_name;
      if (data.thumbnail_url) thumbnail = data.thumbnail_url;
    }
  } catch (e) {
    console.warn("oEmbed fetch failed, continuing with direct fallbacks:", e);
  }

  // 2. Resolve highest resolution thumbnail
  const bestThumb = await getBestThumbnail(youtubeId);
  if (bestThumb) thumbnail = bestThumb;

  // 3. If YOUTUBE_API_KEY is configured, fetch full statistics and duration
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${youtubeId}&key=${apiKey}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const json = await res.json();
        const item = json.items?.[0];
        if (item) {
          title = item.snippet?.title || title;
          description = item.snippet?.description || description;
          publishedAt = item.snippet?.publishedAt || publishedAt;
          views = parseInt(item.statistics?.viewCount || "0", 10);
          if (item.contentDetails?.duration) {
            const parsed = parseIsoDuration(item.contentDetails.duration);
            duration = parsed.formatted;
            if (parsed.totalSeconds <= 60) {
              isShort = true;
            }
          }
        }
      }
    } catch (e) {
      console.warn("YouTube API call failed:", e);
    }
  }

  const suggestedCategorySlug = suggestCategoryFromTitle(title);

  return {
    youtubeId,
    title,
    authorName,
    thumbnail,
    description,
    duration,
    views,
    publishedAt,
    isShort,
    suggestedCategorySlug,
  };
}

/**
 * Fetches all videos from a YouTube playlist URL using local headless Chrome.
 */
export async function fetchPlaylistVideos(playlistInput: string): Promise<{
  playlistTitle: string;
  videos: YouTubePreviewData[];
}> {
  const listId = extractPlaylistId(playlistInput);
  if (!listId) {
    throw new Error("Could not extract a valid YouTube playlist ID from link.");
  }

  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const puppeteerMod = await import("puppeteer-core");
  const puppeteer = puppeteerMod.default || puppeteerMod;

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: ("new" as any),
    args: [
      "--no-sandbox",
      "--disable-gpu",
      "--headless=new",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1280, height: 800 });

    const targetUrl = playlistInput.includes("watch?")
      ? playlistInput
      : `https://www.youtube.com/watch?list=${listId}`;

    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
    await new Promise((r) => setTimeout(r, 3500));

    const data = await page.evaluate(() => {
      const playlistHeader = document.querySelector(
        "ytd-playlist-panel-renderer #header-description h3, #playlist-header-description h3, h3.ytd-playlist-panel-renderer"
      );
      const playlistTitle = playlistHeader?.textContent?.trim() || "Imported YouTube Playlist";

      const items: Array<{ youtubeId: string; title: string; duration: string }> = [];
      const renderers = Array.from(
        document.querySelectorAll("ytd-playlist-panel-video-renderer, ytd-playlist-video-renderer")
      );

      renderers.forEach((el) => {
        const titleEl = el.querySelector("#video-title");
        const href =
          titleEl?.closest("a")?.getAttribute("href") ||
          el.querySelector("a")?.getAttribute("href") ||
          "";
        const m = href.match(/[?&]v=([^&]+)/);
        const title = titleEl?.textContent?.trim() || "";
        const timeEl = el.querySelector(
          "span.ytd-thumbnail-overlay-time-status-renderer, ytd-thumbnail-overlay-time-status-renderer span"
        );
        const duration = timeEl?.textContent?.trim() || "";

        if (m && m[1] && title) {
          items.push({
            youtubeId: m[1],
            title,
            duration,
          });
        }
      });

      return { playlistTitle, items };
    });

    const videos: YouTubePreviewData[] = data.items.map((item) => ({
      youtubeId: item.youtubeId,
      title: item.title,
      authorName: "YouTube Playlist",
      thumbnail: `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`,
      duration: item.duration || "10:00",
      isShort: false,
      suggestedCategorySlug: suggestCategoryFromTitle(item.title),
    }));

    return {
      playlistTitle: data.playlistTitle,
      videos,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Fetches multiple YouTube videos by an array of links or raw IDs.
 */
export async function fetchMultipleVideos(inputs: string[]): Promise<YouTubePreviewData[]> {
  const results = await Promise.allSettled(inputs.map((u) => fetchVideoDetails(u)));
  const videos: YouTubePreviewData[] = [];
  results.forEach((r) => {
    if (r.status === "fulfilled" && r.value) {
      videos.push(r.value);
    }
  });
  return videos;
}

/**
 * Synchronizes channel videos (for cron or manual sync button).
 */
export async function syncChannelVideos(): Promise<{
  newCount: number;
  updatedCount: number;
  totalFetched: number;
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return { newCount: 0, updatedCount: 0, totalFetched: 0 };
  }

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=50`
    );
    if (!res.ok) {
      return { newCount: 0, updatedCount: 0, totalFetched: 0 };
    }
    const data = await res.json();
    const items = data.items || [];
    let newCount = 0;
    let updatedCount = 0;

    for (const item of items) {
      const vid = item.id?.videoId;
      if (!vid) continue;
      const title = item.snippet?.title || "Untitled";
      const description = item.snippet?.description || "";
      const thumbnail =
        item.snippet?.thumbnails?.maxres?.url ||
        item.snippet?.thumbnails?.high?.url ||
        `https://img.youtube.com/vi/${vid}/hqdefault.jpg`;
      const publishedAt = item.snippet?.publishedAt ? new Date(item.snippet.publishedAt) : new Date();

      const existing = await prisma.video.findUnique({
        where: { youtubeId: vid },
      });

      if (!existing) {
        const cat = await prisma.category.findFirst();
        if (cat) {
          await prisma.video.create({
            data: {
              youtubeId: vid,
              title,
              description,
              thumbnail,
              duration: "10:00",
              publishedAt,
              categoryId: cat.id,
            },
          });
          newCount++;
        }
      } else {
        await prisma.video.update({
          where: { youtubeId: vid },
          data: {
            title,
            thumbnail,
          },
        });
        updatedCount++;
      }
    }

    return { newCount, updatedCount, totalFetched: items.length };
  } catch (e) {
    console.error("syncChannelVideos error:", e);
    return { newCount: 0, updatedCount: 0, totalFetched: 0 };
  }
}

