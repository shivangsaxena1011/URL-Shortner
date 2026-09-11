import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "You must be signed in to view your links.",
          },
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const status = searchParams.get("status") || "all";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const now = new Date();

    // Base filter: only this user's links
    const where: Prisma.UrlWhereInput = {
      userId,
    };

    if (search) {
      where.OR = [
        { shortCode: { contains: search, mode: "insensitive" } },
        { customAlias: { contains: search, mode: "insensitive" } },
        { originalUrl: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "active") {
      where.isActive = true;
      where.OR = [{ expiresAt: null }, { expiresAt: { gt: now } }];
    } else if (status === "expired") {
      where.expiresAt = { lte: now };
    } else if (status === "inactive") {
      where.isActive = false;
    }

    const orderBy: Prisma.UrlOrderByWithRelationInput = {};
    if (sortBy === "clickCount") {
      orderBy.clickCount = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Run query and total count in parallel
    const [urls, totalCount, allUserUrls] = await Promise.all([
      prisma.url.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.url.count({ where }),
      // For overall stats cards
      prisma.url.findMany({
        where: { userId },
        select: {
          id: true,
          clickCount: true,
          isActive: true,
          expiresAt: true,
        },
      }),
    ]);

    // Calculate user dashboard stats
    const totalLinks = allUserUrls.length;
    let totalClicks = 0;
    let activeLinks = 0;
    let expiredLinks = 0;

    for (const u of allUserUrls) {
      totalClicks += u.clickCount;
      const isExpired = u.expiresAt && new Date(u.expiresAt) <= now;
      if (isExpired) {
        expiredLinks++;
      } else if (u.isActive) {
        activeLinks++;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        urls,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        stats: {
          totalLinks,
          totalClicks,
          activeLinks,
          expiredLinks,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching URLs:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch URLs.",
        },
      },
      { status: 500 }
    );
  }
}
