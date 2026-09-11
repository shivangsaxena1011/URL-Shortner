import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { mockPrisma, mockDb } = vi.hoisted(() => {
  const mockDb = new Map<string, any>();

  const mockPrisma = {
    url: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    click: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (ops: any[]) => {
      return Promise.all(ops);
    }),
  };

  return { mockPrisma, mockDb };
});

vi.mock("@/lib/db", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

import { POST as shortenHandler } from "../app/api/shorten/route";
import { GET as redirectHandler } from "../app/[shortCode]/route";

describe("Section 34: End-to-End Integration Flow (Create -> Resolve -> Redirect -> Expire)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDb.clear();
  });

  it("Flow 1: Anonymous user shortens URL -> gets short URL -> redirects with 307 and increments clicks", async () => {
    const originalUrl = "https://example.com/deep/page?utm_source=test";

    mockPrisma.url.findFirst.mockResolvedValue(null);
    mockPrisma.url.create.mockImplementation(async ({ data }: any) => {
      const record = {
        id: "rec-1",
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
        clickCount: 0,
      };
      mockDb.set(record.shortCode, record);
      return record;
    });

    // Step 1: POST /api/shorten
    const shortenReq = new NextRequest("http://localhost:3000/api/shorten", {
      method: "POST",
      body: JSON.stringify({ originalUrl }),
    });

    const shortenRes = await shortenHandler(shortenReq);
    const shortenData = await shortenRes.json();

    expect(shortenRes.status).toBe(201);
    expect(shortenData.success).toBe(true);
    expect(shortenData.shortCode).toBeDefined();
    expect(shortenData.originalUrl).toBe(originalUrl);
    expect(shortenData.shortUrl).toContain(shortenData.shortCode);

    const generatedCode = shortenData.shortCode;

    // Step 2: Visitor opens /[shortCode]
    const createdRecord = mockDb.get(generatedCode);
    mockPrisma.url.findFirst.mockResolvedValue(createdRecord);

    const redirectReq = new NextRequest(`http://localhost:3000/${generatedCode}`, {
      headers: {
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        referer: "https://google.com",
      },
    });

    const redirectRes = await redirectHandler(redirectReq, {
      params: { shortCode: generatedCode },
    });

    // Step 3: Verify 307 temporary redirect to original destination
    expect(redirectRes.status).toBe(307);
    expect(redirectRes.headers.get("location")).toBe(originalUrl);

    // Step 4: Verify database transaction was called
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("Flow 2: Custom alias creation and duplicate alias rejection", async () => {
    // First creation succeeds
    mockPrisma.url.findFirst.mockResolvedValueOnce(null);
    mockPrisma.url.create.mockResolvedValue({
      id: "alias-rec-1",
      originalUrl: "https://github.com/test",
      shortCode: "github",
      customAlias: "github",
      userId: null,
      isActive: true,
      expiresAt: null,
      clickCount: 0,
      createdAt: new Date(),
    });

    const req1 = new NextRequest("http://localhost:3000/api/shorten", {
      method: "POST",
      body: JSON.stringify({
        originalUrl: "https://github.com/test",
        customAlias: "github",
      }),
    });

    const res1 = await shortenHandler(req1);
    const data1 = await res1.json();
    expect(res1.status).toBe(201);
    expect(data1.shortCode).toBe("github");

    // Second creation with same alias -> rejected 409 ALIAS_TAKEN
    mockPrisma.url.findFirst.mockResolvedValueOnce({
      id: "alias-rec-1",
      shortCode: "github",
      customAlias: "github",
    });

    const req2 = new NextRequest("http://localhost:3000/api/shorten", {
      method: "POST",
      body: JSON.stringify({
        originalUrl: "https://different.com",
        customAlias: "GITHUB",
      }),
    });

    const res2 = await shortenHandler(req2);
    const data2 = await res2.json();

    expect(res2.status).toBe(409);
    expect(data2.success).toBe(false);
    expect(data2.error.code).toBe("ALIAS_TAKEN");
  });

  it("Flow 3: Expired link redirect blocks redirect and routes to /expired", async () => {
    const pastDate = new Date(Date.now() - 3600 * 1000);
    mockPrisma.url.findFirst.mockResolvedValue({
      id: "expired-id",
      originalUrl: "https://example.com/expired-target",
      shortCode: "exp123",
      customAlias: null,
      isActive: true,
      expiresAt: pastDate,
      clickCount: 5,
    });

    const req = new NextRequest("http://localhost:3000/exp123");
    const res = await redirectHandler(req, { params: { shortCode: "exp123" } });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/expired?code=exp123");
  });

  it("Flow 4: Disabled/Inactive link routes to /inactive", async () => {
    mockPrisma.url.findFirst.mockResolvedValue({
      id: "inactive-id",
      originalUrl: "https://example.com/inactive-target",
      shortCode: "inact1",
      customAlias: null,
      isActive: false,
      expiresAt: null,
      clickCount: 0,
    });

    const req = new NextRequest("http://localhost:3000/inact1");
    const res = await redirectHandler(req, { params: { shortCode: "inact1" } });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/inactive?code=inact1");
  });

  it("Flow 5: Non-existent link routes to /not-found", async () => {
    mockPrisma.url.findFirst.mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/doesNotExist");
    const res = await redirectHandler(req, { params: { shortCode: "doesNotExist" } });

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/not-found?code=doesNotExist");
  });
});
