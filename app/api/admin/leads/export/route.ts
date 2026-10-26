import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Generate CSV rows
  const headers = ["ID", "Name", "Email", "Phone", "Interest", "Source", "Status", "Notes", "Created At"];
  const rows = leads.map((l) => [
    l.id,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${l.phone.replace(/"/g, '""')}"`,
    `"${(l.interest || "").replace(/"/g, '""')}"`,
    `"${l.source.replace(/"/g, '""')}"`,
    l.status,
    `"${(l.notes || "").replace(/"/g, '""')}"`,
    l.createdAt.toISOString(),
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="zenvora-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
