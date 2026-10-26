import { NextRequest, NextResponse } from "next/server";
import { syncChannelVideos } from "@/lib/youtube";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const querySecret = req.nextUrl.searchParams.get("key");
  const expectedSecret = process.env.CRON_SECRET || "cron-secret-zenvora-token";

  if (authHeader !== `Bearer ${expectedSecret}` && querySecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncChannelVideos();
    revalidatePath("/");
    revalidatePath("/watch-tutorials");
    revalidatePath("/resources");

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
