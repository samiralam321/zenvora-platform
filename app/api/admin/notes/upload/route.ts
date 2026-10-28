import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file chunk provided" }, { status: 400 });
    }

    const uploadId = formData.get("uploadId") as string | null;
    const chunkIndexStr = formData.get("chunkIndex") as string | null;
    const totalChunksStr = formData.get("totalChunks") as string | null;
    const filename = (formData.get("filename") as string) || file.name;
    const mimeType = (formData.get("mimeType") as string) || file.type || "application/pdf";

    const arrayBuffer = await file.arrayBuffer();
    const chunkBuffer = Buffer.from(arrayBuffer);

    // If chunked upload parameters are present
    if (uploadId && chunkIndexStr !== null && totalChunksStr !== null) {
      const chunkIndex = parseInt(chunkIndexStr, 10);
      const totalChunks = parseInt(totalChunksStr, 10);

      // Save this chunk
      await prisma.noteUploadChunk.create({
        data: {
          uploadId,
          chunkIndex,
          totalChunks,
          data: chunkBuffer,
        },
      });

      // Count received chunks for this upload
      const receivedChunks = await prisma.noteUploadChunk.findMany({
        where: { uploadId },
        orderBy: { chunkIndex: "asc" },
      });

      if (receivedChunks.length >= totalChunks) {
        // Assemble all chunks in order
        const fullBuffer = Buffer.concat(receivedChunks.map((c) => c.data));

        // Save complete PDF to NoteFile
        const noteFile = await prisma.noteFile.create({
          data: {
            filename,
            mimeType,
            size: fullBuffer.length,
            data: fullBuffer,
          },
        });

        // Clean up temporary chunks
        await prisma.noteUploadChunk.deleteMany({
          where: { uploadId },
        });

        return NextResponse.json({
          url: `/api/notes/pdf/${noteFile.id}`,
          filename,
          size: noteFile.size,
          complete: true,
        });
      }

      return NextResponse.json({
        status: "chunk_received",
        chunkIndex,
        received: receivedChunks.length,
        total: totalChunks,
        complete: false,
      });
    }

    // Direct single-file upload (for small files)
    if (!filename.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
    }

    const noteFile = await prisma.noteFile.create({
      data: {
        filename,
        mimeType,
        size: chunkBuffer.length,
        data: chunkBuffer,
      },
    });

    return NextResponse.json({
      url: `/api/notes/pdf/${noteFile.id}`,
      filename,
      size: noteFile.size,
      complete: true,
    });
  } catch (e: any) {
    console.error("PDF upload error:", e);
    return NextResponse.json({ error: e.message || "Failed to upload PDF" }, { status: 500 });
  }
}
