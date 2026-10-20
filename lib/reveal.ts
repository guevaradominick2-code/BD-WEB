import type { ExperienceEvent, RevealStatus, Role, Surprise } from "@/lib/types";

export function canRevealAt(
  status: RevealStatus,
  revealAt: string,
  now = new Date(),
) {
  if (status === "completed" || status === "revealed") return true;
  return new Date(revealAt).getTime() <= now.getTime();
}

export function effectiveStatus(
  status: RevealStatus,
  revealAt: string,
  now = new Date(),
): RevealStatus {
  if (status === "completed") return "completed";
  return canRevealAt(status, revealAt, now) ? "revealed" : "locked";
}

export function sanitizeEventForRole(
  event: ExperienceEvent,
  role: Role,
  now = new Date(),
): ExperienceEvent {
  const resolved = effectiveStatus(event.status, event.revealAt, now);
  if (role === "admin" || resolved !== "locked") {
    return { ...event, effectiveStatus: resolved };
  }

  return {
    id: event.id,
    title: "Something special is waiting for you...",
    teaser: event.teaser,
    category: event.category,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    revealAt: event.revealAt,
    status: "locked",
    effectiveStatus: "locked",
    clue: event.clue ?? null,
    location: null,
    meetingTime: null,
    dressCode: null,
    bring: null,
    details: null,
    gratitude: null,
    orderIndex: event.orderIndex,
  };
}

export function sanitizeSurpriseForRole(
  surprise: Surprise,
  role: Role,
  now = new Date(),
): Surprise {
  const resolved = effectiveStatus(surprise.status, surprise.revealAt, now);
  if (role === "admin" || resolved !== "locked") {
    return { ...surprise, effectiveStatus: resolved };
  }

  return {
    id: surprise.id,
    name: surprise.label,
    label: surprise.label,
    revealAt: surprise.revealAt,
    eventDate: surprise.eventDate,
    status: "locked",
    effectiveStatus: "locked",
    hint: surprise.hint ?? null,
    message: null,
    imageUrl: null,
    orderIndex: surprise.orderIndex,
  };
}
