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

  const sections = await prisma.section.findMany({
    where: { page: "home" },
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ sections });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sections } = await req.json();

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Invalid sections format" }, { status: 400 });
    }

    for (const sec of sections) {
      await prisma.section.update({
        where: { id: sec.id },
        data: {
          order: sec.order,
          visible: sec.visible,
          data: typeof sec.data === "string" ? sec.data : JSON.stringify(sec.data),
        },
      });
    }

    revalidatePath("/");

    return NextResponse.json({ success: true, message: "Sections updated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update sections" }, { status: 500 });
  }
}
