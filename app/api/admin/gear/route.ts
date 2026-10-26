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

  const gear = await prisma.gearItem.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ gear });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, image, description, price, url, category } = await req.json();

    const gear = await prisma.gearItem.create({
      data: {
        name,
        image: image || "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&auto=format&fit=crop&q=80",
        description,
        price: price || null,
        url,
        category: category || "Audio",
      },
    });

    revalidatePath("/my-gear");
    return NextResponse.json({ success: true, gear });
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
    const { id, name, image, description, price, url, category } = await req.json();

    const gear = await prisma.gearItem.update({
      where: { id },
      data: {
        name,
        image,
        description,
        price,
        url,
        category,
      },
    });

    revalidatePath("/my-gear");
    return NextResponse.json({ success: true, gear });
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

    await prisma.gearItem.delete({ where: { id } });
    revalidatePath("/my-gear");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
