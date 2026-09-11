import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    const { id } = context.params;

    const url = await prisma.url.findUnique({
      where: { id },
      include: {
        clicks: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!url) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "URL not found" } },
        { status: 404 }
      );
    }

    // If link has an owner, only allow that owner to view full analytics
    if (url.userId && url.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Forbidden" } },
        { status: 403 }
      );
    }

    const clicks = url.clicks;
    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    let clicksToday = 0;
    let clicksThisWeek = 0;
    let clicksThisMonth = 0;

    const dayMap = new Map<string, number>();
    // Pre-fill last 7 days so charts look complete even with 0 clicks
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dayMap.set(key, 0);
    }

    const deviceMap = new Map<string, number>();
    const browserMap = new Map<string, number>();
    const osMap = new Map<string, number>();
    const referrerMap = new Map<string, number>();

    for (const c of clicks) {
      const clickDate = new Date(c.timestamp);

      if (clickDate >= startOfToday) {
        clicksToday++;
      }
      if (clickDate >= sevenDaysAgo) {
        clicksThisWeek++;
      }
      if (clickDate >= thirtyDaysAgo) {
        clicksThisMonth++;
      }

      // Group for clicks over time (last 7 days)
      const dayKey = clickDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (dayMap.has(dayKey)) {
        dayMap.set(dayKey, (dayMap.get(dayKey) || 0) + 1);
      }

      // Group devices
      const device = c.device || "desktop";
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);

      // Group browsers
      const browser = c.browser || "Other";
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);

      // Group OS
      const os = c.operatingSystem || "Other";
      osMap.set(os, (osMap.get(os) || 0) + 1);

      // Group referrers
      const ref = c.referrer || "Direct";
      referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);
    }

    const clicksOverTime = Array.from(dayMap.entries()).map(([date, count]) => ({
      date,
      clicks: count,
    }));

    const mapToSortedList = (map: Map<string, number>) =>
      Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    return NextResponse.json({
      success: true,
      data: {
        url: {
          id: url.id,
          shortCode: url.shortCode,
          customAlias: url.customAlias,
          originalUrl: url.originalUrl,
          createdAt: url.createdAt,
          expiresAt: url.expiresAt,
          isActive: url.isActive,
          clickCount: url.clickCount,
        },
        analytics: {
          totalClicks: clicks.length,
          clicksToday,
          clicksThisWeek,
          clicksThisMonth,
          clicksOverTime,
          devices: mapToSortedList(deviceMap),
          browsers: mapToSortedList(browserMap),
          operatingSystems: mapToSortedList(osMap),
          referrers: mapToSortedList(referrerMap),
          recentClicks: clicks.slice(0, 30),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch analytics." } },
      { status: 500 }
    );
  }
}
