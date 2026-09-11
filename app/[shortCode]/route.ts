import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { parseRequestAnalytics } from "@/lib/analytics";
import { RESERVED_ALIASES } from "@/lib/validation";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: {
    shortCode: string;
  };
}

export async function GET(req: NextRequest, context: RouteContext) {
  const { shortCode } = context.params;

  // If the shortCode is a static file (e.g. favicon.ico) return 404
  if (shortCode.includes(".")) {
    return new NextResponse(null, { status: 404 });
  }

  // If the shortCode is a reserved route, redirect to not-found
  if (RESERVED_ALIASES.has(shortCode.toLowerCase())) {
    return NextResponse.redirect(new URL("/not-found", req.url), 307);
  }

  try {
    // Look up by shortCode or customAlias (case-insensitive for vanity aliases)
    const urlRecord = await prisma.url.findFirst({
      where: {
        OR: [
          { shortCode: { equals: shortCode, mode: "insensitive" } },
          { customAlias: { equals: shortCode, mode: "insensitive" } },
        ],
      },
    });

    // 1. Check if URL exists
    if (!urlRecord) {
      return NextResponse.redirect(
        new URL(`/not-found?code=${encodeURIComponent(shortCode)}`, req.url),
        307
      );
    }

    // 2. Check if URL is active
    if (!urlRecord.isActive) {
      return NextResponse.redirect(
        new URL(`/inactive?code=${encodeURIComponent(shortCode)}`, req.url),
        307
      );
    }

    // 3. Check expiration
    if (urlRecord.expiresAt && new Date(urlRecord.expiresAt) <= new Date()) {
      return NextResponse.redirect(
        new URL(`/expired?code=${encodeURIComponent(shortCode)}`, req.url),
        307
      );
    }

    // 4. Parse click analytics
    const analytics = parseRequestAnalytics(req);

    // 5. Record click and increment clickCount in parallel / background
    try {
      await prisma.$transaction([
        prisma.click.create({
          data: {
            urlId: urlRecord.id,
            referrer: analytics.referrer,
            userAgent: analytics.userAgent,
            country: analytics.country,
            device: analytics.device,
            browser: analytics.browser,
            operatingSystem: analytics.operatingSystem,
          },
        }),
        prisma.url.update({
          where: { id: urlRecord.id },
          data: {
            clickCount: { increment: 1 },
          },
        }),
      ]);
    } catch (recordError) {
      // Don't block the redirect if analytics recording fails
      console.error("Failed to record click analytics:", recordError);
    }

    // 6. Perform HTTP 307 redirect to destination
    return NextResponse.redirect(urlRecord.originalUrl, 307);
  } catch (error) {
    console.error("Error in redirect route:", error);
    return NextResponse.redirect(new URL("/not-found", req.url), 307);
  }
}
