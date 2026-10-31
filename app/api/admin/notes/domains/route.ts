import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

function requireAdmin() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET — list all domains
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return requireAdmin();
  try {
    const domains = await prisma.notesDomain.findMany({
      orderBy: { displayOrder: "asc" },
      include: { _count: { select: { notes: true } } },
    });
    return NextResponse.json({ domains });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST — create domain
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return requireAdmin();
  try {
    const body = await req.json();
    const { name, description, iconName, accentColor, pastelBg, pastelBorder, badgeBg, badgeText, displayOrder, isPublished } = body;
    if (!name || !description) {
      return NextResponse.json({ error: "name and description are required" }, { status: 400 });
    }
    const slug = body.slug || slugify(name);
    const existing = await prisma.notesDomain.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "A domain with this slug already exists" }, { status: 409 });
    }
    const domain = await prisma.notesDomain.create({
      data: {
        name,
        slug,
        description,
        iconName: iconName || "FileText",
        accentColor: accentColor || "#1D64EC",
        pastelBg: pastelBg || "#EEF4FF",
        pastelBorder: pastelBorder || "#BFDBFE",
        badgeBg: badgeBg || "#DBEAFE",
        badgeText: badgeText || "#1E40AF",
        displayOrder: displayOrder ?? 0,
        isPublished: isPublished ?? false,
      },
    });

    try {
      revalidatePath("/notes");
      revalidateTag("notes_domains");
    } catch (e) {}

    return NextResponse.json({ domain }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH — update domain
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return requireAdmin();
  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const domain = await prisma.notesDomain.update({ where: { id }, data });
    try {
      revalidatePath("/notes");
      revalidateTag("notes_domains");
    } catch (e) {}
    return NextResponse.json({ domain });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — delete domain
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return requireAdmin();
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await prisma.notesDomain.delete({ where: { id } });
    try {
      revalidatePath("/notes");
      revalidateTag("notes_domains");
    } catch (e) {}
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
