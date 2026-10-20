import { describe, expect, it } from "vitest";
import { canRevealAt, sanitizeEventForRole } from "@/lib/reveal";
import type { ExperienceEvent } from "@/lib/types";

const event: ExperienceEvent = {
  id: "secret-event",
  title: "Secret destination",
  teaser: "Pack lightly.",
  category: "Our Adventure",
  startsAt: "2026-11-13T07:00:00-06:00",
  revealAt: "2026-11-09T18:00:00-06:00",
  status: "locked",
  effectiveStatus: "locked",
  clue: "Listen to the sea.",
  location: "A private beach house",
  meetingTime: "06:30",
  dressCode: "Tropical",
  bring: "Passport",
  details: "Reservation reference 123",
  orderIndex: 1,
};

describe("server reveal rules", () => {
  it("does not include secret fields before reveal time", () => {
    const result = sanitizeEventForRole(
      event,
      "girlfriend",
      new Date("2026-11-01T12:00:00-06:00"),
    );
    expect(result.effectiveStatus).toBe("locked");
    expect(result.title).not.toBe(event.title);
    expect(result.location).toBeNull();
    expect(result.details).toBeNull();
    expect(JSON.stringify(result)).not.toContain("Reservation reference");
  });

  it("reveals after the configured instant regardless of browser timezone", () => {
    expect(
      canRevealAt(
        "locked",
        "2026-11-09T18:00:00-06:00",
        new Date("2026-11-10T00:00:01.000Z"),
      ),
    ).toBe(true);
  });

  it("allows admins to preview the complete record", () => {
    const result = sanitizeEventForRole(
      event,
      "admin",
      new Date("2026-11-01T12:00:00-06:00"),
    );
    expect(result.location).toBe("A private beach house");
    expect(result.details).toContain("Reservation reference");
  });
});
