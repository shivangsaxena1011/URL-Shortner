import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { isValidHttpUrl, isValidExpirationDate } from "@/lib/validation";

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

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { id } = context.params;

    const url = await prisma.url.findUnique({
      where: { id },
      include: {
        clicks: {
          orderBy: { timestamp: "desc" },
          take: 50,
        },
      },
    });

    if (!url) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "URL not found" } },
        { status: 404 }
      );
    }

    if (url.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this link." } },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: url });
  } catch (error) {
    console.error("Error fetching URL:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch link." } },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { id } = context.params;

    const existing = await prisma.url.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "URL not found" } },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to edit this link." } },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const updateData: {
      originalUrl?: string;
      isActive?: boolean;
      expiresAt?: Date | null;
    } = {};

    if (body.originalUrl !== undefined) {
      const val = isValidHttpUrl(body.originalUrl);
      if (!val.valid) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_URL", message: val.error || "Invalid URL" } },
          { status: 400 }
        );
      }
      updateData.originalUrl = body.originalUrl.trim();
    }

    if (typeof body.isActive === "boolean") {
      updateData.isActive = body.isActive;
    }

    if (body.expiresAt !== undefined) {
      if (body.expiresAt === null || body.expiresAt === "") {
        updateData.expiresAt = null;
      } else {
        const val = isValidExpirationDate(body.expiresAt);
        if (!val.valid) {
          return NextResponse.json(
            { success: false, error: { code: "INVALID_EXPIRATION", message: val.error || "Invalid date" } },
            { status: 400 }
          );
        }
        updateData.expiresAt = val.date || null;
      }
    }

    const updated = await prisma.url.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Error updating URL:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update link." } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
        { status: 401 }
      );
    }

    const { id } = context.params;

    const existing = await prisma.url.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "URL not found" } },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have permission to delete this link." } },
        { status: 403 }
      );
    }

    await prisma.url.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "URL deleted successfully." });
  } catch (error) {
    console.error("Error deleting URL:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete link." } },
      { status: 500 }
    );
  }
}
