import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncChannelVideos } from "@/lib/youtube";
import { revalidatePath } from "next/cache";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await syncChannelVideos();

    // Revalidate public pages
    try {
      revalidatePath("/");
      revalidatePath("/watch-tutorials");
      revalidatePath("/resources");
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: `Sync complete: ${result.newCount} new videos, ${result.updatedCount} updated.`,
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 });
  }
}
