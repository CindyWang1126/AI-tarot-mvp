import { beforeEach, describe, expect, it } from "vitest";
import {
  beginRequest,
  checkRateLimit,
  endRequest,
  resetRateLimitForTests,
} from "@/lib/rate-limit";

describe("best-effort request protection", () => {
  beforeEach(() => resetRateLimitForTests());

  it("limits the fifth request within one minute", () => {
    for (let index = 0; index < 4; index += 1) {
      expect(checkRateLimit("client", 1_000).allowed).toBe(true);
    }
    expect(checkRateLimit("client", 1_000)).toMatchObject({ allowed: false });
  });

  it("prevents concurrent requests for the same reading", () => {
    expect(beginRequest("client:reading")).toBe(true);
    expect(beginRequest("client:reading")).toBe(false);
    endRequest("client:reading");
    expect(beginRequest("client:reading")).toBe(true);
  });
});
