import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {};
    if (category && category !== "all") {
      where.category = category;
    }
    if (status && status !== "all") {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { organization: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      orderBy: [{ featured: "desc" }, { order: "asc" }, { updatedAt: "desc" }],
    });

    return NextResponse.json({ success: true, opportunities });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      organization,
      category,
      categories,
      summary,
      content,
      contentType = "manual",
      youtubeUrl,
      youtubeId,
      thumbnail,
      // New eligibility fields
      academicYears,
      eligibleDegrees,
      eligibleBranches,
      genderEligibility = "All Genders",
      geographicRestrictions = "India & Global",
      minQualifications,
      eligibility,
      participationType = "Individual",
      difficulty = "Beginner Friendly",
      keyBenefit,
      howItWorks,
      prepGuide,
      prerequisites,
      benefits,
      applyProcess,
      applicationUrl,
      sourceUrl,
      availabilityStatus = "Information Available",
      isHistorical = false,
      lastVerified,
      dates,
      status = "Open",
      tags,
      tips,
      faq,
      featured = false,
      published = false,
      order = 0,
    } = body;

    if (!title || !organization || !category) {
      return NextResponse.json(
        { error: "Title, organization, and category are required." },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const cleanSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    // Check slug uniqueness
    const existing = await prisma.opportunity.findUnique({
      where: { slug: cleanSlug },
    });
    const finalSlug = existing ? `${cleanSlug}-${Date.now().toString().slice(-4)}` : cleanSlug;

    const opportunity = await prisma.opportunity.create({
      data: {
        title: title.trim(),
        slug: finalSlug,
        organization: organization.trim(),
        category: category.trim(),
        categories: typeof categories === "object" ? JSON.stringify(categories) : categories || null,
        summary: summary?.trim() || "",
        content: content?.trim() || "",
        contentType,
        youtubeUrl: youtubeUrl?.trim() || null,
        youtubeId: youtubeId?.trim() || null,
        thumbnail: thumbnail?.trim() || null,
        // Eligibility
        academicYears: typeof academicYears === "object" ? JSON.stringify(academicYears) : academicYears || null,
        eligibleDegrees: eligibleDegrees?.trim() || null,
        eligibleBranches: eligibleBranches?.trim() || null,
        genderEligibility: genderEligibility?.trim() || "All Genders",
        geographicRestrictions: geographicRestrictions?.trim() || "India & Global",
        minQualifications: minQualifications?.trim() || null,
        eligibility: eligibility?.trim() || null,
        participationType: participationType?.trim() || "Individual",
        difficulty: difficulty?.trim() || "Beginner Friendly",
        keyBenefit: keyBenefit?.trim() || null,
        howItWorks: howItWorks?.trim() || null,
        prepGuide: prepGuide?.trim() || null,
        prerequisites: prerequisites?.trim() || null,
        benefits: benefits?.trim() || null,
        applyProcess: applyProcess?.trim() || null,
        applicationUrl: applicationUrl?.trim() || null,
        sourceUrl: sourceUrl?.trim() || null,
        availabilityStatus: availabilityStatus?.trim() || "Information Available",
        isHistorical: Boolean(isHistorical),
        lastVerified: lastVerified?.trim() || null,
        dates: dates?.trim() || null,
        status,
        tags: typeof tags === "object" ? JSON.stringify(tags) : tags || null,
        tips: tips?.trim() || null,
        faq: typeof faq === "object" ? JSON.stringify(faq) : faq || null,
        featured: Boolean(featured),
        published: Boolean(published),
        publishedAt: published ? new Date() : null,
        order: Number(order) || 0,
      },
    });

    revalidatePath("/opportunities");
    revalidatePath("/resources");
    return NextResponse.json({ success: true, opportunity });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create opportunity" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }

    if (data.published === true && !data.publishedAt) {
      data.publishedAt = new Date();
    }

    if (typeof data.tags === "object") data.tags = JSON.stringify(data.tags);
    if (typeof data.faq === "object") data.faq = JSON.stringify(data.faq);

    const updated = await prisma.opportunity.update({
      where: { id },
      data,
    });

    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${updated.slug}`);
    revalidatePath("/resources");
    return NextResponse.json({ success: true, opportunity: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update opportunity" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }

    const deleted = await prisma.opportunity.delete({
      where: { id },
    });

    revalidatePath("/opportunities");
    revalidatePath("/resources");
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete opportunity" },
      { status: 500 }
    );
  }
}
