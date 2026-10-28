import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
    }

    // Limit to 4.5 MB for Vercel Serverless payload limits
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Direct upload is limited to 15 MB. For larger PDFs, please paste an external link." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Save directly into Neon PostgreSQL database — 100% serverless compatible, zero ENOENT errors!
    const noteFile = await prisma.noteFile.create({
      data: {
        filename: file.name,
        mimeType: file.type || "application/pdf",
        size: file.size,
        data: buffer,
      },
    });

    const publicUrl = `/api/notes/pdf/${noteFile.id}`;

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      size: file.size,
    });
  } catch (e: any) {
    console.error("PDF upload error:", e);
    return NextResponse.json({ error: e.message || "Failed to upload PDF" }, { status: 500 });
  }
}
