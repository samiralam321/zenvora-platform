import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function pingUrl(url?: string | null): Promise<{ ok: boolean; status: number; message: string }> {
  if (!url || !url.trim()) return { ok: false, status: 0, message: "No URL provided" };
  try {
    const res = await fetch(url.trim(), {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    // 200-399 are valid
    if (res.ok || (res.status >= 200 && res.status < 400)) {
      return { ok: true, status: res.status, message: "Accessible (HTTP " + res.status + ")" };
    }

    // Some sites like Cloudflare/Akamai block direct automated bots with 403, but the page exists
    if (res.status === 403) {
      return { ok: true, status: 403, message: "Protected by Bot Shield (Page Exists)" };
    }

    if (res.status === 404) {
      return { ok: false, status: 404, message: "404 Page Not Found" };
    }

    return { ok: false, status: res.status, message: `HTTP ${res.status}` };
  } catch (err: any) {
    if (err.name === "TimeoutError" || err.message?.includes("timeout")) {
      return { ok: true, status: 408, message: "Connection timeout (slow server)" };
    }
    return { ok: false, status: 0, message: err.message || "Network Error" };
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const targetId = body.id as string | undefined;

    const scholarships = await prisma.scholarship.findMany({
      where: targetId ? { id: targetId } : undefined,
    });

    const results = [];
    let brokenCount = 0;
    let verifiedCount = 0;

    for (const s of scholarships) {
      const offCheck = await pingUrl(s.officialUrl);
      const appCheck = s.applicationUrl ? await pingUrl(s.applicationUrl) : { ok: true, status: 200, message: "No separate application link" };

      const has404 = offCheck.status === 404 || appCheck.status === 404;
      const isOk = !has404 && offCheck.ok && appCheck.ok;

      let newStatus = isOk ? "verified" : "broken";
      let notes = `Official: ${offCheck.message} · App: ${appCheck.message}`;

      if (has404) {
        brokenCount++;
      } else {
        verifiedCount++;
      }

      await prisma.scholarship.update({
        where: { id: s.id },
        data: {
          verificationStatus: newStatus,
          verificationNotes: notes,
          lastVerified: new Date(),
          isVerified: isOk,
        },
      });

      results.push({
        id: s.id,
        name: s.name,
        officialUrl: s.officialUrl,
        applicationUrl: s.applicationUrl,
        offCheck,
        appCheck,
        status: newStatus,
        notes,
      });
    }

    try {
      revalidatePath("/opportunities/scholarships");
      revalidatePath("/opportunities");
    } catch {}

    return NextResponse.json({
      success: true,
      totalChecked: scholarships.length,
      verifiedCount,
      brokenCount,
      results,
    });
  } catch (err: any) {
    console.error("Link verification error:", err);
    return NextResponse.json({ error: err.message || "Verification failed" }, { status: 500 });
  }
}
