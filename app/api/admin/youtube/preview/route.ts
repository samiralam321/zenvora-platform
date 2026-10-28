import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  fetchVideoDetails,
  fetchPlaylistVideos,
  fetchMultipleVideos,
  extractPlaylistId,
  extractYouTubeId,
} from "@/lib/youtube";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const trimmed = url.trim();

    // Check if multiple URLs pasted (separated by newlines or commas)
    const lines = trimmed
      .split(/[\r\n,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && (s.includes("youtube") || s.includes("youtu.be") || s.length === 11));

    if (lines.length > 1) {
      const videos = await fetchMultipleVideos(lines);
      if (videos.length === 0) {
        return NextResponse.json({ error: "Could not fetch any videos from the provided links." }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        isPlaylist: true,
        playlistTitle: `Curated Series (${videos.length} Lectures)`,
        channelName: videos[0]?.authorName || "",
        videos,
      });
    }

    // Check if it's a playlist URL
    const listId = extractPlaylistId(trimmed);
    if (listId && trimmed.includes("list=")) {
      let playlistErr = "";
      try {
        const playlistResult = await fetchPlaylistVideos(trimmed);
        if (playlistResult.videos.length > 0) {
          const detectedChannel = playlistResult.channelName || playlistResult.videos[0]?.authorName || "";
          return NextResponse.json({
            success: true,
            isPlaylist: true,
            youtubePlaylistId: listId,
            playlistTitle: playlistResult.playlistTitle || "Imported Course Playlist",
            channelName: detectedChannel,
            videos: playlistResult.videos,
          });
        }
      } catch (err: any) {
        playlistErr = err.message || "";
        console.warn("Playlist extraction failed, checking for video parameter:", err);
      }

      const { id: singleId } = extractYouTubeId(trimmed);
      if (!singleId) {
        return NextResponse.json(
          {
            error:
              playlistErr ||
              "Could not load playlist automatically. You can paste video links directly into this box (one per line) to batch import.",
          },
          { status: 400 }
        );
      }
    }

    // Check if it's a single video
    const details = await fetchVideoDetails(trimmed);
    return NextResponse.json({
      success: true,
      isPlaylist: false,
      video: details,
      channelName: details.authorName || "",
      videos: [details],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to preview YouTube content" }, { status: 500 });
  }
}
