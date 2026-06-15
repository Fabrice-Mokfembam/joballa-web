import {
  homePathForRole,
  isGuestOnlyPath,
  isProtectedPortalPath,
  isSafeCallbackPath,
  portalPrefixForRole,
  resolveAuthDestination,
  roleMayAccessPortalPath,
  splitLocalePath,
} from "@/lib/auth/route-protection";

describe("route-protection", () => {
  describe("splitLocalePath", () => {
    it("strips en locale prefix", () => {
      expect(splitLocalePath("/en/worker/jobs")).toEqual({
        locale: "en",
        path: "/worker/jobs",
      });
    });

    it("defaults to en when no locale", () => {
      expect(splitLocalePath("/worker")).toEqual({ locale: "en", path: "/worker" });
    });
  });

  describe("isProtectedPortalPath", () => {
    it("recognizes worker and employer portals", () => {
      expect(isProtectedPortalPath("/worker/dashboard")).toBe(true);
      expect(isProtectedPortalPath("/employer/jobs")).toBe(true);
      expect(isProtectedPortalPath("/")).toBe(false);
    });
  });

  describe("isGuestOnlyPath", () => {
    it("recognizes sign-in routes", () => {
      expect(isGuestOnlyPath("/sign-in")).toBe(true);
      expect(isGuestOnlyPath("/sign-in/email")).toBe(true);
      expect(isGuestOnlyPath("/worker")).toBe(false);
    });
  });

  describe("portalPrefixForRole", () => {
    it("maps roles to portal prefixes", () => {
      expect(portalPrefixForRole("WORKER")).toBe("/worker");
      expect(portalPrefixForRole("EMPLOYER")).toBe("/employer");
    });
  });

  describe("roleMayAccessPortalPath", () => {
    it("allows worker only on worker routes", () => {
      expect(roleMayAccessPortalPath("WORKER", "/worker/jobs")).toBe(true);
      expect(roleMayAccessPortalPath("WORKER", "/employer")).toBe(false);
    });

    it("allows employer only on employer routes", () => {
      expect(roleMayAccessPortalPath("EMPLOYER", "/employer/jobs")).toBe(true);
      expect(roleMayAccessPortalPath("EMPLOYER", "/worker")).toBe(false);
    });
  });

  describe("isSafeCallbackPath", () => {
    it("rejects external URLs", () => {
      expect(isSafeCallbackPath("//evil.com")).toBe(false);
      expect(isSafeCallbackPath("https://evil.com")).toBe(false);
    });

    it("accepts portal paths", () => {
      expect(isSafeCallbackPath("/worker/jobs")).toBe(true);
    });
  });

  describe("resolveAuthDestination", () => {
    it("honors safe callback for matching role", () => {
      expect(resolveAuthDestination("/worker/jobs", "WORKER", null)).toBe("/worker/jobs");
    });

    it("ignores callback when role cannot access portal", () => {
      expect(resolveAuthDestination("/employer", "WORKER", null)).toBe("/worker");
    });

    it("falls back to role home", () => {
      expect(resolveAuthDestination(null, "EMPLOYER", null)).toBe("/employer");
      expect(homePathForRole("WORKER")).toBe("/worker");
    });
  });
});
