import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [videos, categories, playlists] = await Promise.all([
    prisma.video.findMany({
      include: { category: true, playlist: true },
      orderBy: [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.playlist.findMany({
      include: {
        category: true,
        _count: { select: { videos: true } },
      },
      orderBy: { order: "asc" },
    }),
  ]);

  return NextResponse.json({ videos, categories, playlists });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    let targetPlaylistId = body.playlistId && body.playlistId !== "new" && body.playlistId !== "none"
      ? body.playlistId
      : null;

    // Auto-create playlist if a playlistTitle is supplied and no existing playlistId is selected
    if (!targetPlaylistId && body.playlistTitle && body.playlistTitle.trim() && body.playlistId !== "none") {
      const pTitle = body.playlistTitle.trim();
      let pSlug = pTitle
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-");

      const existingP = await prisma.playlist.findUnique({ where: { slug: pSlug } });
      if (existingP) {
        pSlug = `${pSlug}-${Date.now().toString().slice(-4)}`;
      }

      const pCount = await prisma.playlist.count({ where: { categoryId: body.categoryId || undefined } });

      const newPlaylist = await prisma.playlist.create({
        data: {
          title: pTitle,
          slug: pSlug,
          channelName: body.channelName?.trim() || null,
          categoryId: body.categoryId || null,
          thumbnail: body.videos?.[0]?.thumbnail || body.thumbnail || null,
          youtubeId: body.youtubePlaylistId || null,
          order: pCount + 1,
        },
      });
      targetPlaylistId = newPlaylist.id;
    }

    // 1. Batch Save (from YouTube playlist or multiple video links)
    if (Array.isArray(body.videos)) {
      const { categoryId, videos, featureFirst, channelName } = body;
      const savedVideos = [];

      for (let i = 0; i < videos.length; i++) {
        const v = videos[i];
        if (!v.youtubeId || !v.title) continue;

        const effectiveChannel = channelName?.trim() || v.authorName || null;

        const saved = await prisma.video.upsert({
          where: { youtubeId: v.youtubeId },
          update: {
            title: v.title,
            description: v.description || null,
            thumbnail: v.thumbnail,
            duration: v.duration || null,
            isShort: Boolean(v.isShort),
            categoryId: categoryId || v.categoryId || null,
            playlistId: targetPlaylistId,
            channelName: effectiveChannel,
            featured: i === 0 && Boolean(featureFirst),
            visible: true,
          },
          create: {
            youtubeId: v.youtubeId,
            title: v.title,
            description: v.description || null,
            thumbnail: v.thumbnail,
            duration: v.duration || null,
            isShort: Boolean(v.isShort),
            categoryId: categoryId || v.categoryId || null,
            playlistId: targetPlaylistId,
            channelName: effectiveChannel,
            featured: i === 0 && Boolean(featureFirst),
            visible: true,
            order: i + 1,
          },
        });
        savedVideos.push(saved);
      }

      try {
        revalidatePath("/");
        revalidatePath("/watch-tutorials");
      } catch (e) {}

      return NextResponse.json({
        success: true,
        count: savedVideos.length,
        playlistId: targetPlaylistId,
        videos: savedVideos,
      });
    }

    // 2. Single Video Save
    const {
      youtubeId,
      title,
      description,
      thumbnail,
      duration,
      isShort,
      categoryId,
      featured,
      channelName,
    } = body;

    if (!youtubeId || !title) {
      return NextResponse.json({ error: "YouTube ID and Title are required" }, { status: 400 });
    }

    const video = await prisma.video.upsert({
      where: { youtubeId },
      update: {
        title,
        description,
        thumbnail,
        duration,
        isShort: Boolean(isShort),
        categoryId: categoryId || null,
        playlistId: targetPlaylistId,
        channelName: channelName?.trim() || null,
        featured: Boolean(featured),
        visible: true,
      },
      create: {
        youtubeId,
        title,
        description,
        thumbnail,
        duration,
        isShort: Boolean(isShort),
        categoryId: categoryId || null,
        playlistId: targetPlaylistId,
        channelName: channelName?.trim() || null,
        featured: Boolean(featured),
        visible: true,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/watch-tutorials");
    } catch (e) {}

    return NextResponse.json({ success: true, video, playlistId: targetPlaylistId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save video" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      id,
      title,
      description,
      thumbnail,
      categoryId,
      playlistId,
      channelName,
      featured,
      visible,
      isShort,
    } = await req.json();

    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const video = await prisma.video.update({
      where: { id },
      data: {
        title,
        description,
        thumbnail,
        categoryId: categoryId !== undefined ? categoryId || null : undefined,
        playlistId: playlistId !== undefined ? playlistId || null : undefined,
        channelName: channelName !== undefined ? channelName?.trim() || null : undefined,
        featured: Boolean(featured),
        visible: Boolean(visible),
        isShort: Boolean(isShort),
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/watch-tutorials");
    } catch (e) {}

    return NextResponse.json({ success: true, video });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update video" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const playlistId = searchParams.get("playlistId");

    if (playlistId) {
      // Delete entire playlist and its videos
      await prisma.video.deleteMany({ where: { playlistId } });
      await prisma.playlist.delete({ where: { id: playlistId } });
    } else if (id) {
      await prisma.video.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Video ID or playlistId required" }, { status: 400 });
    }

    try {
      revalidatePath("/");
      revalidatePath("/watch-tutorials");
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
