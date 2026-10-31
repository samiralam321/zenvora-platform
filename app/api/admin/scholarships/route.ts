import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET - list scholarships
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
      ];
    }

    const scholarships = await prisma.scholarship.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ scholarships });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - create scholarship
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, organization, ...rest } = body;

    if (!name || !organization) {
      return NextResponse.json(
        { error: "Scholarship name and organization are required" },
        { status: 400 }
      );
    }

    let baseSlug = body.slug ? slugify(body.slug) : slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.scholarship.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const scholarship = await prisma.scholarship.create({
      data: {
        ...rest,
        name: name.trim(),
        organization: organization.trim(),
        slug,
        isNational: rest.isNational !== undefined ? Boolean(rest.isNational) : true,
        verificationStatus: rest.verificationStatus || "verified",
        verificationNotes: rest.verificationNotes || null,
        benefits: typeof rest.benefits === "object" ? JSON.stringify(rest.benefits) : rest.benefits,
        requiredDocuments:
          typeof rest.requiredDocuments === "object"
            ? JSON.stringify(rest.requiredDocuments)
            : rest.requiredDocuments,
        applicationProcess:
          typeof rest.applicationProcess === "object"
            ? JSON.stringify(rest.applicationProcess)
            : rest.applicationProcess,
        tags: typeof rest.tags === "object" ? JSON.stringify(rest.tags) : rest.tags,
      },
    });

    try {
      revalidatePath("/opportunities/scholarships");
      revalidatePath(`/opportunities/scholarships/${scholarship.slug}`);
      revalidatePath("/opportunities");
    } catch {}

    return NextResponse.json({ scholarship }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - update scholarship
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Scholarship ID is required" }, { status: 400 });
    }

    if (data.benefits && typeof data.benefits === "object") {
      data.benefits = JSON.stringify(data.benefits);
    }
    if (data.requiredDocuments && typeof data.requiredDocuments === "object") {
      data.requiredDocuments = JSON.stringify(data.requiredDocuments);
    }
    if (data.applicationProcess && typeof data.applicationProcess === "object") {
      data.applicationProcess = JSON.stringify(data.applicationProcess);
    }
    if (data.tags && typeof data.tags === "object") {
      data.tags = JSON.stringify(data.tags);
    }

    if (data.isNational !== undefined) {
      data.isNational = Boolean(data.isNational);
    }
    if (data.isVerified !== undefined) {
      data.isVerified = Boolean(data.isVerified);
    }
    if (data.isFeatured !== undefined) {
      data.isFeatured = Boolean(data.isFeatured);
    }
    if (data.isPublished !== undefined) {
      data.isPublished = Boolean(data.isPublished);
    }

    const scholarship = await prisma.scholarship.update({
      where: { id },
      data,
    });

    try {
      revalidatePath("/opportunities/scholarships");
      revalidatePath(`/opportunities/scholarships/${scholarship.slug}`);
      revalidatePath("/opportunities");
    } catch {}

    return NextResponse.json({ scholarship });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - delete scholarship
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Scholarship ID is required" }, { status: 400 });
    }

    await prisma.scholarship.delete({ where: { id } });

    try {
      revalidatePath("/opportunities/scholarships");
      revalidatePath("/opportunities");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
