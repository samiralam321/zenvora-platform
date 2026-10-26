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

  const [settings, navItems, sections, categories, videos, tools, gear, resources, reels, pages] =
    await Promise.all([
      prisma.setting.findMany(),
      prisma.navItem.findMany(),
      prisma.section.findMany(),
      prisma.category.findMany(),
      prisma.video.findMany(),
      prisma.tool.findMany(),
      prisma.gearItem.findMany(),
      prisma.resourceItem.findMany(),
      prisma.reel.findMany(),
      prisma.page.findMany(),
    ]);

  const backupData = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    settings,
    navItems,
    sections,
    categories,
    videos,
    tools,
    gear,
    resources,
    reels,
    pages,
  };

  return new NextResponse(JSON.stringify(backupData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="zenvora-backup-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backup = await req.json();

    if (!backup.settings || !backup.sections) {
      return NextResponse.json({ error: "Invalid backup JSON file structure" }, { status: 400 });
    }

    // Restore settings
    if (Array.isArray(backup.settings)) {
      for (const s of backup.settings) {
        await prisma.setting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value },
        });
      }
    }

    // Restore sections
    if (Array.isArray(backup.sections)) {
      for (const sec of backup.sections) {
        await prisma.section.upsert({
          where: { id: sec.id },
          update: {
            order: sec.order,
            visible: sec.visible,
            data: sec.data,
          },
          create: {
            id: sec.id,
            page: sec.page || "home",
            type: sec.type,
            order: sec.order,
            visible: sec.visible,
            data: sec.data,
          },
        });
      }
    }

    revalidatePath("/");
    revalidatePath("/watch-tutorials");
    revalidatePath("/recommended-tools");
    revalidatePath("/my-gear");
    revalidatePath("/resources");

    return NextResponse.json({ success: true, message: "Backup successfully restored!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
