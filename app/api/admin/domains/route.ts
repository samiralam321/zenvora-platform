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

  const domains = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      _count: {
        select: {
          videos: true,
          resources: true,
        },
      },
    },
  });

  return NextResponse.json({ domains });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug, icon, description, order } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Domain name and slug are required" }, { status: 400 });
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const existing = await prisma.category.findUnique({ where: { slug: cleanSlug } });
    if (existing) {
      return NextResponse.json({ error: "A domain with this slug already exists" }, { status: 400 });
    }

    const domain = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: cleanSlug,
        icon: icon?.trim() || "Sparkles",
        description: description?.trim() || null,
        order: Number(order) || 0,
      },
    });

    revalidatePath("/");
    revalidatePath("/watch-tutorials");
    revalidatePath("/resources");

    return NextResponse.json({ success: true, domain });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create domain" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, slug, icon, description, order } = await req.json();

    if (!id || !name || !slug) {
      return NextResponse.json({ error: "Domain ID, name, and slug are required" }, { status: 400 });
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-");

    const domain = await prisma.category.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: cleanSlug,
        icon: icon?.trim() || "Sparkles",
        description: description?.trim() || null,
        order: Number(order) || 0,
      },
    });

    revalidatePath("/");
    revalidatePath("/watch-tutorials");
    revalidatePath("/resources");

    return NextResponse.json({ success: true, domain });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update domain" }, { status: 500 });
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

    if (!id) {
      return NextResponse.json({ error: "Domain ID required" }, { status: 400 });
    }

    // Unlink any videos or resources
    await prisma.video.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });
    await prisma.resourceItem.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    });

    await prisma.category.delete({ where: { id } });

    revalidatePath("/");
    revalidatePath("/watch-tutorials");
    revalidatePath("/resources");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete domain" }, { status: 500 });
  }
}
