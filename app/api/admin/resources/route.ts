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

  const [resources, categories, videos] = await Promise.all([
    prisma.resourceItem.findMany({
      include: { category: true, video: true },
      orderBy: { order: "asc" },
    }),
    prisma.category.findMany({ orderBy: { order: "asc" } }),
    prisma.video.findMany({
      select: { id: true, title: true, youtubeId: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({ resources, categories, videos });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, categoryId, videoId, promptText, fileUrl, locked } = await req.json();

    const resource = await prisma.resourceItem.create({
      data: {
        title,
        description,
        categoryId: categoryId || null,
        videoId: videoId || null,
        promptText: promptText || null,
        fileUrl: fileUrl || null,
        locked: Boolean(locked),
      },
    });

    revalidatePath("/resources");
    return NextResponse.json({ success: true, resource });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, description, categoryId, videoId, promptText, fileUrl, locked } = await req.json();

    const resource = await prisma.resourceItem.update({
      where: { id },
      data: {
        title,
        description,
        categoryId: categoryId || null,
        videoId: videoId || null,
        promptText: promptText || null,
        fileUrl: fileUrl || null,
        locked: Boolean(locked),
      },
    });

    revalidatePath("/resources");
    return NextResponse.json({ success: true, resource });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update" }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.resourceItem.delete({ where: { id } });
    revalidatePath("/resources");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
