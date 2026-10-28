import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return new NextResponse("File ID required", { status: 400 });
  }

  try {
    const file = await prisma.noteFile.findUnique({
      where: { id },
    });

    if (!file || !file.data) {
      return new NextResponse("PDF not found", { status: 404 });
    }

    const safeFilename = encodeURIComponent(file.filename);

    return new NextResponse(new Uint8Array(file.data), {
      status: 200,
      headers: {
        "Content-Type": file.mimeType || "application/pdf",
        "Content-Disposition": `inline; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
        "Content-Length": file.size.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e: any) {
    console.error("Error serving note PDF:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
