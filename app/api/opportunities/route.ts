import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "featured"; // featured, newest, title

    const where: any = {
      published: true,
    };

    if (category && category !== "all") {
      where.category = category;
    }
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { organization: { contains: search } },
        { summary: { contains: search } },
        { tags: { contains: search } },
      ];
    }

    let orderBy: any[] = [{ featured: "desc" }, { order: "asc" }, { createdAt: "desc" }];
    if (sort === "newest") {
      orderBy = [{ createdAt: "desc" }];
    } else if (sort === "title") {
      orderBy = [{ title: "asc" }];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy,
    });

    return NextResponse.json({ success: true, opportunities });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load opportunities" },
      { status: 500 }
    );
  }
}
