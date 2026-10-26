import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId");

  const playlists = await prisma.playlist.findMany({
    where: categoryId && categoryId !== "all" ? { categoryId } : undefined,
    include: {
      category: true,
      videos: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { videos: true },
      },
    },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ playlists });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, channelName, categoryId, description } = await req.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Playlist title is required" }, { status: 400 });
    }

    const cleanTitle = title.trim();
    let slug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.playlist.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const count = await prisma.playlist.count({ where: { categoryId: categoryId || undefined } });

    const playlist = await prisma.playlist.create({
      data: {
        title: cleanTitle,
        slug,
        channelName: channelName?.trim() || null,
        description: description?.trim() || null,
        categoryId: categoryId || null,
        order: count + 1,
      },
      include: {
        category: true,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/watch-tutorials");
    } catch (e) {}

    return NextResponse.json({ success: true, playlist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create playlist" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, channelName, categoryId, order, visible } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 });
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        title: title ? title.trim() : undefined,
        channelName: channelName !== undefined ? channelName?.trim() || null : undefined,
        categoryId: categoryId !== undefined ? categoryId || null : undefined,
        order: order !== undefined ? Number(order) : undefined,
        visible: visible !== undefined ? Boolean(visible) : undefined,
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/watch-tutorials");
    } catch (e) {}

    return NextResponse.json({ success: true, playlist });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update playlist" }, { status: 500 });
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
    const deleteVideos = searchParams.get("deleteVideos") === "true";

    if (!id) {
      return NextResponse.json({ error: "Playlist ID required" }, { status: 400 });
    }

    if (deleteVideos) {
      await prisma.video.deleteMany({ where: { playlistId: id } });
    } else {
      // Unlink videos so they become standalone
      await prisma.video.updateMany({
        where: { playlistId: id },
        data: { playlistId: null },
      });
    }

    await prisma.playlist.delete({ where: { id } });

    try {
      revalidatePath("/");
      revalidatePath("/watch-tutorials");
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete playlist" }, { status: 500 });
  }
}
