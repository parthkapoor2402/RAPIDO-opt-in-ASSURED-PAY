import { describe, expect, it } from "vitest";

import { normalizeApiBaseUrl } from "@/lib/api";

describe("normalizeApiBaseUrl", () => {
  it("defaults when empty", () => {
    expect(normalizeApiBaseUrl(undefined)).toBe("http://localhost:8000");
    expect(normalizeApiBaseUrl("")).toBe("http://localhost:8000");
  });

  it("strips trailing slashes", () => {
    expect(normalizeApiBaseUrl("https://api.example.com/")).toBe("https://api.example.com");
    expect(normalizeApiBaseUrl("https://api.example.com///")).toBe("https://api.example.com");
  });
});
