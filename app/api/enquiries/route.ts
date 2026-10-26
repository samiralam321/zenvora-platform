import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const rateLimits = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const maxSubmissions = 5;

  const timestamps = (rateLimits.get(ip) || []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxSubmissions) {
    return false;
  }
  timestamps.push(now);
  rateLimits.set(ip, timestamps);
  return true;
}

const enquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid work email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  budget: z.string().optional(),
  service: z.string().optional(),
  message: z.string().min(5, "Message must be at least 5 characters").max(2000),
  consent: z.boolean().refine((val) => val === true, "Consent is required"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many enquiries. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validated = enquirySchema.parse(body);

    const enquiry = await prisma.enquiry.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase(),
        phone: validated.phone || null,
        company: validated.company || null,
        budget: validated.budget || null,
        service: validated.service || null,
        message: validated.message,
        consent: validated.consent,
        status: "New",
      },
    });

    return NextResponse.json({ success: true, enquiryId: enquiry.id }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0]?.message || "Validation failed." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to process enquiry." },
      { status: 500 }
    );
  }
}
