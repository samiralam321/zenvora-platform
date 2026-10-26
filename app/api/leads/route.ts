import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

// Simple in-memory rate limiting map: ip -> timestamps[]
const rateLimits = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxSubmissions = 5;

  const timestamps = (rateLimits.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxSubmissions) {
    return false;
  }
  timestamps.push(now);
  rateLimits.set(ip, timestamps);
  return true;
}

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(6, "Please provide a valid phone or WhatsApp number").max(25),
  interest: z.string().optional(),
  source: z.string().optional().default("unlock_modal"),
  consent: z.boolean().refine((val) => val === true, "Consent is required"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again in an hour." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = leadSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        phone: validated.phone,
        interest: validated.interest || "General",
        source: validated.source || "resources_modal",
        consent: validated.consent,
        status: "New",
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to process lead." },
      { status: 500 }
    );
  }
}
