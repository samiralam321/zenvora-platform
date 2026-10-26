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

  const setting = await prisma.setting.findUnique({
    where: { key: "site_settings" },
  });

  return NextResponse.json({
    settings: setting?.value ? JSON.parse(setting.value) : {},
  });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    await prisma.setting.upsert({
      where: { key: "site_settings" },
      update: { value: JSON.stringify(body) },
      create: {
        key: "site_settings",
        value: JSON.stringify(body),
      },
    });

    revalidatePath("/");
    revalidatePath("/watch-tutorials");
    revalidatePath("/recommended-tools");
    revalidatePath("/my-gear");
    revalidatePath("/resources");

    return NextResponse.json({ success: true, message: "Settings saved successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
