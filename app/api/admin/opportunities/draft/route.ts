import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchVideoDetails, extractYouTubeId } from "@/lib/youtube";
import { generateOpportunityDraft } from "@/lib/opportunity-ai";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, extraNotes } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    const { id: youtubeId } = extractYouTubeId(url.trim());
    if (!youtubeId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL. Please provide a standard YouTube video link." },
        { status: 400 }
      );
    }

    // 1. Fetch available video metadata (via oEmbed and optional YouTube Data API)
    const videoDetails = await fetchVideoDetails(url.trim());

    // 2. Generate structured opportunity draft
    const draft = await generateOpportunityDraft({
      title: videoDetails.title,
      channelName: videoDetails.authorName,
      description: videoDetails.description,
      youtubeId,
      youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
      extraNotes: extraNotes || "",
    });

    return NextResponse.json({
      success: true,
      video: videoDetails,
      draft: {
        ...draft,
        youtubeId,
        youtubeUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
        thumbnail: videoDetails.thumbnail,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate opportunity draft" },
      { status: 500 }
    );
  }
}
