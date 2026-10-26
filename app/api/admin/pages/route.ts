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

  const pages = await prisma.page.findMany({
    orderBy: { slug: "asc" },
  });

  return NextResponse.json({ pages });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, title, metaDescription, ogImage, content } = await req.json();

    const page = await prisma.page.update({
      where: { id },
      data: {
        title,
        metaDescription,
        ogImage,
        content,
        updatedAt: new Date(),
      },
    });

    revalidatePath(`/${page.slug}`);
    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
