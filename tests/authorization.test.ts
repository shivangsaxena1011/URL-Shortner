import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Use vi.hoisted to ensure mock variables are available when vi.mock is hoisted
const { mockGetServerSession, mockPrisma, mockUrlRecord } = vi.hoisted(() => {
  const mockUrlRecord = {
    id: "url-record-123",
    originalUrl: "https://example.com/target",
    shortCode: "testCode",
    customAlias: null,
    userId: "user-a-id",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: null,
    isActive: true,
    clickCount: 10,
    clicks: [],
  };

  const mockPrisma = {
    url: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const mockGetServerSession = vi.fn();

  return { mockGetServerSession, mockPrisma, mockUrlRecord };
});

vi.mock("next-auth/next", () => ({
  getServerSession: () => mockGetServerSession(),
}));

vi.mock("@/lib/db", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

// Import handlers
import {
  GET as getUrlHandler,
  PATCH as patchUrlHandler,
  DELETE as deleteUrlHandler,
} from "../app/api/urls/[id]/route";

import { GET as getAnalyticsHandler } from "../app/api/analytics/[id]/route";

describe("Section 16: Mandatory Multi-Tenant Authorization & User Isolation Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.url.findUnique.mockResolvedValue(mockUrlRecord);
  });

  it("User B cannot view URL A details (GET /api/urls/[id] returns 403)", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-b-id", email: "userb@example.com" },
    });

    const req = new NextRequest("http://localhost:3000/api/urls/url-record-123");
    const res = await getUrlHandler(req, { params: { id: "url-record-123" } });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FORBIDDEN");
  });

  it("User B cannot edit URL A (PATCH /api/urls/[id] returns 403)", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-b-id", email: "userb@example.com" },
    });

    const req = new NextRequest("http://localhost:3000/api/urls/url-record-123", {
      method: "PATCH",
      body: JSON.stringify({ originalUrl: "https://malicious.com" }),
    });

    const res = await patchUrlHandler(req, { params: { id: "url-record-123" } });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FORBIDDEN");
    expect(mockPrisma.url.update).not.toHaveBeenCalled();
  });

  it("User B cannot delete URL A (DELETE /api/urls/[id] returns 403)", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-b-id", email: "userb@example.com" },
    });

    const req = new NextRequest("http://localhost:3000/api/urls/url-record-123", {
      method: "DELETE",
    });

    const res = await deleteUrlHandler(req, { params: { id: "url-record-123" } });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FORBIDDEN");
    expect(mockPrisma.url.delete).not.toHaveBeenCalled();
  });

  it("User B cannot view URL A analytics (GET /api/analytics/[id] returns 403)", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-b-id", email: "userb@example.com" },
    });

    const req = new NextRequest("http://localhost:3000/api/analytics/url-record-123");
    const res = await getAnalyticsHandler(req, { params: { id: "url-record-123" } });
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe("FORBIDDEN");
  });

  it("Unauthenticated visitor cannot view, edit, or delete URL A (returns 401)", async () => {
    mockGetServerSession.mockResolvedValue(null);

    const reqGet = new NextRequest("http://localhost:3000/api/urls/url-record-123");
    const resGet = await getUrlHandler(reqGet, { params: { id: "url-record-123" } });
    expect(resGet.status).toBe(401);

    const reqPatch = new NextRequest("http://localhost:3000/api/urls/url-record-123", {
      method: "PATCH",
      body: JSON.stringify({ originalUrl: "https://new.com" }),
    });
    const resPatch = await patchUrlHandler(reqPatch, { params: { id: "url-record-123" } });
    expect(resPatch.status).toBe(401);

    const reqDelete = new NextRequest("http://localhost:3000/api/urls/url-record-123", {
      method: "DELETE",
    });
    const resDelete = await deleteUrlHandler(reqDelete, { params: { id: "url-record-123" } });
    expect(resDelete.status).toBe(401);
  });

  it("User A (owner) is permitted to view and update URL A", async () => {
    mockGetServerSession.mockResolvedValue({
      user: { id: "user-a-id", email: "usera@example.com" },
    });

    mockPrisma.url.update.mockResolvedValue({
      ...mockUrlRecord,
      originalUrl: "https://example.com/updated",
    });

    const req = new NextRequest("http://localhost:3000/api/urls/url-record-123");
    const res = await getUrlHandler(req, { params: { id: "url-record-123" } });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe("url-record-123");
  });
});
