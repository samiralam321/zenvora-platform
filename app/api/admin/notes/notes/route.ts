import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

function requireAdmin() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// GET — list notes (optionally filtered by domainId)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return requireAdmin();
  const domainId = req.nextUrl.searchParams.get("domainId");
  try {
    const notes = await prisma.note.findMany({
      where: domainId ? { domainId } : undefined,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      include: { domain: { select: { name: true, slug: true } } },
    });
    return NextResponse.json({ notes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — create note
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return requireAdmin();
  try {
    const body = await req.json();
    const { domainId, title, description, storagePath, originalFilename, fileSize, pageCount, displayOrder, status } = body;
    if (!domainId || !title) {
      return NextResponse.json({ error: "domainId and title are required" }, { status: 400 });
    }
    const baseSlug = slugify(title);
    // ensure unique within domain
    let slug = baseSlug;
    let attempt = 1;
    while (true) {
      const exists = await prisma.note.findUnique({ where: { domainId_slug: { domainId, slug } } });
      if (!exists) break;
      slug = `${baseSlug}-${++attempt}`;
    }
    const note = await prisma.note.create({
      data: {
        domainId,
        title,
        slug,
        description: description || "",
        storagePath: storagePath || null,
        originalFilename: originalFilename || null,
        fileSize: fileSize || null,
        pageCount: pageCount || null,
        displayOrder: displayOrder ?? 0,
        status: status || "draft",
        publishedAt: status === "published" ? new Date() : null,
      },
    });
    return NextResponse.json({ note }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH — update note
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return requireAdmin();
  try {
    const body = await req.json();
    const { id, status, ...rest } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const updateData: any = { ...rest };
    if (status !== undefined) {
      updateData.status = status;
      if (status === "published") updateData.publishedAt = new Date();
      else updateData.publishedAt = null;
    }
    const note = await prisma.note.update({ where: { id }, data: updateData });
    return NextResponse.json({ note });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — delete note
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return requireAdmin();
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.note.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
