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

  const items = await prisma.navItem.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { label, url, area, isButton } = await req.json();
    const count = await prisma.navItem.count();

    const item = await prisma.navItem.create({
      data: {
        label,
        url,
        area: area || "header",
        isButton: Boolean(isButton),
        order: count + 1,
        visible: true,
      },
    });

    revalidatePath("/");
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items } = await req.json();

    if (Array.isArray(items)) {
      for (const it of items) {
        await prisma.navItem.update({
          where: { id: it.id },
          data: {
            label: it.label,
            url: it.url,
            order: it.order,
            visible: it.visible,
            isButton: it.isButton,
          },
        });
      }
    }

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    await prisma.navItem.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
