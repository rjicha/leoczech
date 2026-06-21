import { describe, it, expect } from "vitest";
import { computeHmac, verifyHmac } from "../src/crypto";

describe("computeHmac", () => {
  it("produces a deterministic hex string", async () => {
    const a = await computeHmac("secret", "43:10:alice@example.com");
    const b = await computeHmac("secret", "43:10:alice@example.com");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces different output for different data", async () => {
    const a = await computeHmac("secret", "43:10:alice@example.com");
    const b = await computeHmac("secret", "44:10:alice@example.com");
    expect(a).not.toBe(b);
  });

  it("produces different output for different secrets", async () => {
    const a = await computeHmac("secret1", "data");
    const b = await computeHmac("secret2", "data");
    expect(a).not.toBe(b);
  });
});

describe("verifyHmac", () => {
  it("returns true for valid token", async () => {
    const token = await computeHmac("secret", "43:10:alice@example.com");
    const valid = await verifyHmac("secret", "43:10:alice@example.com", token);
    expect(valid).toBe(true);
  });

  it("returns false for tampered token", async () => {
    const valid = await verifyHmac("secret", "43:10:alice@example.com", "deadbeef");
    expect(valid).toBe(false);
  });

  it("returns false for wrong data", async () => {
    const token = await computeHmac("secret", "43:10:alice@example.com");
    const valid = await verifyHmac("secret", "44:10:alice@example.com", token);
    expect(valid).toBe(false);
  });
});
