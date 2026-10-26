import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";

  const whereClause: any = {};
  if (status !== "all") {
    whereClause.status = status;
  }
  if (search.trim()) {
    whereClause.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const leads = await prisma.lead.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ leads });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status, notes } = await req.json();

    const updated = await prisma.lead.update({
      where: { id },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json({ success: true, lead: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update lead" }, { status: 500 });
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
    const bulk = searchParams.get("bulk");

    if (bulk === "true") {
      const { ids } = await req.json();
      if (Array.isArray(ids)) {
        await prisma.lead.deleteMany({
          where: { id: { in: ids } },
        });
        return NextResponse.json({ success: true, count: ids.length });
      }
    }

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.lead.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete lead" }, { status: 500 });
  }
}
