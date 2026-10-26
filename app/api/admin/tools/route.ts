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

  const tools = await prisma.tool.findMany({
    orderBy: { order: "asc" },
  });

  return NextResponse.json({ tools });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    let { name, logo, oneLiner, description, tag, url, showOnHome } = body;

    // Auto-fetch logo from URL domain if not provided
    if (!logo && url) {
      try {
        const domain = new URL(url).hostname;
        logo = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      } catch (e) {
        logo = "https://icons.duckduckgo.com/ip3/google.com.ico";
      }
    }

    const tool = await prisma.tool.create({
      data: {
        name,
        logo: logo || "https://icons.duckduckgo.com/ip3/google.com.ico",
        oneLiner: oneLiner || "",
        description: description || "",
        tag: tag || "Tool",
        url,
        showOnHome: Boolean(showOnHome),
      },
    });

    revalidatePath("/");
    revalidatePath("/recommended-tools");

    return NextResponse.json({ success: true, tool });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create tool" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, logo, oneLiner, description, tag, url, showOnHome, order } = await req.json();

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        name,
        logo,
        oneLiner,
        description,
        tag,
        url,
        showOnHome: Boolean(showOnHome),
        order: order !== undefined ? order : undefined,
      },
    });

    revalidatePath("/");
    revalidatePath("/recommended-tools");

    return NextResponse.json({ success: true, tool });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update tool" }, { status: 500 });
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

    await prisma.tool.delete({ where: { id } });
    revalidatePath("/");
    revalidatePath("/recommended-tools");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete" }, { status: 500 });
  }
}
