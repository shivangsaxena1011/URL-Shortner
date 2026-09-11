import { describe, it, expect } from "vitest";
import {
  isValidHttpUrl,
  isValidCustomAlias,
  isValidExpirationDate,
  RESERVED_ALIASES,
} from "../lib/validation";

describe("URL Validation", () => {
  it("accepts valid https and http URLs", () => {
    expect(isValidHttpUrl("https://example.com").valid).toBe(true);
    expect(isValidHttpUrl("http://example.com/some/path?id=123").valid).toBe(true);
    expect(isValidHttpUrl("https://sub.domain.co.uk/page#anchor").valid).toBe(true);
  });

  it("rejects empty or whitespace URLs", () => {
    expect(isValidHttpUrl("").valid).toBe(false);
    expect(isValidHttpUrl("   ").valid).toBe(false);
  });

  it("rejects dangerous or unsupported schemes", () => {
    expect(isValidHttpUrl("javascript:alert(1)").valid).toBe(false);
    expect(isValidHttpUrl("data:text/html,<script>alert(1)</script>").valid).toBe(false);
    expect(isValidHttpUrl("file:///etc/passwd").valid).toBe(false);
    expect(isValidHttpUrl("vbscript:msgbox(1)").valid).toBe(false);
  });

  it("rejects malformed URLs without protocol", () => {
    expect(isValidHttpUrl("httpx://invalid").valid).toBe(false);
    expect(isValidHttpUrl("not-a-valid-url").valid).toBe(false);
  });
});

describe("Custom Alias Validation", () => {
  it("accepts valid alphanumeric aliases with hyphens and underscores", () => {
    expect(isValidCustomAlias("github").valid).toBe(true);
    expect(isValidCustomAlias("my-project_2026").valid).toBe(true);
    expect(isValidCustomAlias("abc").valid).toBe(true);
  });

  it("rejects aliases shorter than 3 or longer than 30 characters", () => {
    expect(isValidCustomAlias("a").valid).toBe(false);
    expect(isValidCustomAlias("ab").valid).toBe(false);
    expect(isValidCustomAlias("a".repeat(31)).valid).toBe(false);
  });

  it("rejects special characters and spaces", () => {
    expect(isValidCustomAlias("my project").valid).toBe(false);
    expect(isValidCustomAlias("link@short").valid).toBe(false);
    expect(isValidCustomAlias("test/slug").valid).toBe(false);
  });

  it("rejects reserved routes", () => {
    for (const reserved of Array.from(RESERVED_ALIASES).slice(0, 5)) {
      expect(isValidCustomAlias(reserved).valid).toBe(false);
    }
  });
});

describe("Expiration Date Validation", () => {
  it("accepts valid dates in the future", () => {
    const future = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const result = isValidExpirationDate(future);
    expect(result.valid).toBe(true);
    expect(result.date).toBeInstanceOf(Date);
  });

  it("rejects past dates", () => {
    const past = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const result = isValidExpirationDate(past);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Expiration date must be in the future.");
  });

  it("accepts empty or null expiration (permanent)", () => {
    expect(isValidExpirationDate(null).valid).toBe(true);
    expect(isValidExpirationDate("").valid).toBe(true);
  });
});
