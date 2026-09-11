import { describe, it, expect } from "vitest";
import { checkRateLimit } from "../lib/rate-limit";

describe("Rate Limiting", () => {
  it("allows requests under the limit", async () => {
    const id = `test-client-${Date.now()}`;
    const result1 = await checkRateLimit(id, { limit: 3, windowSeconds: 10 });
    expect(result1.success).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = await checkRateLimit(id, { limit: 3, windowSeconds: 10 });
    expect(result2.success).toBe(true);
    expect(result2.remaining).toBe(1);
  });

  it("blocks requests once the limit is exceeded", async () => {
    const id = `test-blocked-${Date.now()}`;
    await checkRateLimit(id, { limit: 2, windowSeconds: 10 });
    await checkRateLimit(id, { limit: 2, windowSeconds: 10 });

    const result3 = await checkRateLimit(id, { limit: 2, windowSeconds: 10 });
    expect(result3.success).toBe(false);
    expect(result3.remaining).toBe(0);
    expect(result3.reset).toBeGreaterThan(0);
  });
});
