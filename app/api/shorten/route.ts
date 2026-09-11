import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  isValidHttpUrl,
  isValidCustomAlias,
  isValidExpirationDate,
} from "@/lib/validation";
import { generateUniqueShortCode } from "@/lib/short-code";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getBaseUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    // Rate limiting: 10/min for anonymous, 60/min for authenticated
    const ip = getClientIp(req);
    const rateLimitIdentifier = userId ? `user:${userId}` : `ip:${ip}`;
    const rateConfig = userId
      ? { limit: 60, windowSeconds: 60 }
      : { limit: 10, windowSeconds: 60 };

    const rateCheck = await checkRateLimit(rateLimitIdentifier, rateConfig);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. Please try again later.",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateCheck.reset.toString(),
          },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const rawOriginalUrl = body.originalUrl;
    const rawCustomAlias = body.customAlias;
    const rawExpiresAt = body.expiresAt;

    // Validate original URL
    const urlValidation = isValidHttpUrl(rawOriginalUrl);
    if (!urlValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_URL",
            message: urlValidation.error || "Please enter a valid HTTP or HTTPS URL.",
          },
        },
        { status: 400 }
      );
    }
    const originalUrl = (rawOriginalUrl as string).trim();

    // Validate custom alias if provided
    let shortCode = "";
    let customAlias: string | null = null;

    if (rawCustomAlias && typeof rawCustomAlias === "string" && rawCustomAlias.trim().length > 0) {
      const alias = rawCustomAlias.trim().toLowerCase();
      const aliasValidation = isValidCustomAlias(alias);
      if (!aliasValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_ALIAS",
              message: aliasValidation.error || "Invalid custom alias.",
            },
          },
          { status: 400 }
        );
      }

      // Check if alias already exists (case-insensitive)
      const existing = await prisma.url.findFirst({
        where: {
          OR: [
            { shortCode: { equals: alias, mode: "insensitive" } },
            { customAlias: { equals: alias, mode: "insensitive" } },
          ],
        },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "ALIAS_TAKEN",
              message: "This alias is already taken.",
            },
          },
          { status: 409 }
        );
      }

      shortCode = alias;
      customAlias = alias;
    } else {
      // Generate random unique short code
      shortCode = await generateUniqueShortCode();
    }

    // Validate expiration date
    let expiresAt: Date | null = null;
    if (rawExpiresAt) {
      const expiryValidation = isValidExpirationDate(rawExpiresAt);
      if (!expiryValidation.valid) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_EXPIRATION",
              message: expiryValidation.error || "Expiration date must be in the future.",
            },
          },
          { status: 400 }
        );
      }
      expiresAt = expiryValidation.date || null;
    }

    // Save to database
    const createdUrl = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        customAlias,
        userId: userId || null,
        expiresAt,
        isActive: true,
      },
    });

    const host = req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const appUrl = host ? `${proto}://${host}` : getBaseUrl();
    const activeCode = createdUrl.customAlias || createdUrl.shortCode;
    const shortUrl = `${appUrl}/${activeCode}`;

    return NextResponse.json(
      {
        success: true,
        shortCode: activeCode,
        shortUrl,
        originalUrl: createdUrl.originalUrl,
        data: {
          id: createdUrl.id,
          shortCode: createdUrl.shortCode,
          shortUrl,
          originalUrl: createdUrl.originalUrl,
          customAlias: createdUrl.customAlias,
          expiresAt: createdUrl.expiresAt,
          createdAt: createdUrl.createdAt,
          clickCount: createdUrl.clickCount,
          isActive: createdUrl.isActive,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error shortening URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred while shortening the URL.",
        },
      },
      { status: 500 }
    );
  }
}
