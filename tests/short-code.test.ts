import { describe, it, expect } from "vitest";
import { generateRandomCode } from "../lib/short-code";

describe("Short Code Generator", () => {
  it("generates code of requested length", () => {
    const code6 = generateRandomCode(6);
    expect(code6).toHaveLength(6);

    const code8 = generateRandomCode(8);
    expect(code8).toHaveLength(8);
  });

  it("only contains allowed characters without ambiguous ones", () => {
    const code = generateRandomCode(100);
    // Should NOT contain 0, O, 1, I, l
    expect(code).not.toMatch(/[0O1Il]/);
    // Should only contain valid alphanumeric
    expect(code).toMatch(/^[2-9a-km-zA-HJ-NP-Z]+$/);
  });

  it("generates distinct codes across successive calls", () => {
    const set = new Set<string>();
    for (let i = 0; i < 50; i++) {
      set.add(generateRandomCode(6));
    }
    expect(set.size).toBe(50);
  });
});
