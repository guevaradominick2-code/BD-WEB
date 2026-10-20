import "server-only";

import { demoData } from "@/lib/demo-data";
import { sanitizeEventForRole, sanitizeSurpriseForRole } from "@/lib/reveal";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminData,
  AppSettings,
  ExperienceData,
  ExperienceEvent,
  LoveLetter,
  Memory,
  Mission,
  Surprise,
  Viewer,
} from "@/lib/types";

type Row = Record<string, unknown>;

function eventFromRow(row: Row): ExperienceEvent {
  return {
    id: String(row.id),
    title: String(row.title ?? "Something special is waiting for you..."),
    teaser: String(row.teaser ?? "A little mystery is on its way."),
    category: String(row.category ?? "Special moment"),
    startsAt: String(row.starts_at),
    endsAt: row.ends_at ? String(row.ends_at) : null,
    revealAt: String(row.reveal_at),
    status: (row.status as ExperienceEvent["status"]) ?? "locked",
    effectiveStatus:
      (row.effective_status as ExperienceEvent["effectiveStatus"]) ??
      (row.status as ExperienceEvent["status"]) ??
      "locked",
    clue: row.clue ? String(row.clue) : null,
    location: row.location ? String(row.location) : null,
    meetingTime: row.meeting_time ? String(row.meeting_time) : null,
    dressCode: row.dress_code ? String(row.dress_code) : null,
    bring: row.bring ? String(row.bring) : null,
    details: row.details ? String(row.details) : null,
    gratitude: row.gratitude ? String(row.gratitude) : null,
    orderIndex: Number(row.order_index ?? 0),
  };
}

function surpriseFromRow(row: Row): Surprise {
  return {
    id: String(row.id),
    name: String(row.name ?? row.label ?? "A sealed surprise"),
    label: String(row.label ?? "Envelope"),
    revealAt: String(row.reveal_at),
    eventDate: row.event_date ? String(row.event_date) : null,
    status: (row.status as Surprise["status"]) ?? "locked",
    effectiveStatus:
      (row.effective_status as Surprise["effectiveStatus"]) ??
      (row.status as Surprise["status"]) ??
      "locked",
    hint: row.hint ? String(row.hint) : null,
    message: row.message ? String(row.message) : null,
    imageUrl: row.image_url ? String(row.image_url) : null,
    orderIndex: Number(row.order_index ?? 0),
  };
}

function letterFromRow(row: Row): LoveLetter {
  return {
    id: String(row.id),
    title: String(row.title),
    excerpt: String(row.excerpt ?? "A few words waiting for you."),
    body: row.body ? String(row.body) : null,
    revealAt: String(row.reveal_at),
    status: (row.status as LoveLetter["status"]) ?? "published",
    unlocked: Boolean(row.unlocked ?? row.body),
    read: Boolean(row.read),
    orderIndex: Number(row.order_index ?? 0),
  };
}

function settingsFromRow(row?: Row | null): AppSettings {
  return {
    celebrationId: String(row?.celebration_id ?? ""),
    girlfriendName: String(row?.girlfriend_name ?? "My Love"),
    birthday: String(row?.birthday ?? "2026-11-08T00:00:00-06:00"),
    timezone: String(row?.timezone ?? "America/Costa_Rica"),
    heroMessage: String(row?.hero_message ?? "Happy Birthday, My Love"),
    welcomeMessage: String(
      row?.welcome_message ??
        "Quería regalarte momentos que podamos recordar para siempre.",
    ),
    palette: (row?.palette as AppSettings["palette"]) ?? demoData.settings.palette,
  };
}

async function signMemoryUrls(rows: Row[]): Promise<Memory[]> {
  const supabase = await createClient();
  return Promise.all(
    rows.map(async (row) => {
      let imageUrl = String(row.image_url ?? row.storage_path ?? "");
      if (row.storage_path) {
        const { data } = await supabase.storage
          .from("memories")
          .createSignedUrl(String(row.storage_path), 3600);
        imageUrl = data?.signedUrl ?? "";
      }
      return {
        id: String(row.id),
        title: String(row.title),
        date: row.memory_date ? String(row.memory_date) : null,
        place: row.place ? String(row.place) : null,
        description: String(row.description ?? ""),
        romanticNote: String(row.romantic_note ?? ""),
        category: String(row.category ?? "Us"),
        imageUrl,
        featured: Boolean(row.featured),
      };
    }),
  );
}

export async function getExperienceData(viewer: Viewer): Promise<ExperienceData> {
  if (viewer.demo) {
    return {
      ...demoData,
      events: demoData.events.map((event) =>
        sanitizeEventForRole(event, viewer.role),
      ),
      surprises: demoData.surprises.map((surprise) =>
        sanitizeSurpriseForRole(surprise, viewer.role),
      ),
      letters: demoData.letters.map((letter) => ({
        ...letter,
        body: letter.unlocked || viewer.role === "admin" ? letter.body : null,
      })),
    };
  }

  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("celebrations")
    .select("id")
    .or(`owner_id.eq.${viewer.id},guest_id.eq.${viewer.id}`)
    .limit(1)
    .single();

  if (!membership) throw new Error("No celebration is assigned to this account.");
  const celebrationId = membership.id as string;

  const [settingsResult, eventsResult, surprisesResult, memoriesResult, lettersResult, missionsResult] =
    await Promise.all([
      supabase
        .from("app_settings")
        .select("*")
        .eq("celebration_id", celebrationId)
        .single(),
      viewer.role === "admin"
        ? supabase.from("events").select("*").eq("celebration_id", celebrationId).order("order_index")
        : supabase.rpc("get_revealed_events", { p_celebration_id: celebrationId }),
      viewer.role === "admin"
        ? supabase.from("surprises").select("*").eq("celebration_id", celebrationId).order("order_index")
        : supabase.rpc("get_revealed_surprises", { p_celebration_id: celebrationId }),
      supabase
        .from("memories")
        .select("*")
        .eq("celebration_id", celebrationId)
        .eq("published", true)
        .order("order_index"),
      viewer.role === "admin"
        ? supabase.from("letters").select("*").eq("celebration_id", celebrationId).order("order_index")
        : supabase.rpc("get_available_letters", { p_celebration_id: celebrationId }),
      supabase
        .from("missions")
        .select("*")
        .eq("celebration_id", celebrationId)
        .eq("active", true)
        .order("order_index"),
    ]);

  const firstError = [eventsResult, surprisesResult, memoriesResult, lettersResult].find(
    (result) => result.error,
  )?.error;
  if (firstError) throw new Error(firstError.message);

  const settings = settingsFromRow(settingsResult.data as Row | null);
  settings.celebrationId = celebrationId;
  const settingsRow = settingsResult.data as Row | null;

  return {
    settings,
    events: ((eventsResult.data ?? []) as Row[]).map(eventFromRow),
    surprises: ((surprisesResult.data ?? []) as Row[]).map(surpriseFromRow),
    memories: await signMemoryUrls((memoriesResult.data ?? []) as Row[]),
    letters: ((lettersResult.data ?? []) as Row[]).map(letterFromRow),
    missions: ((missionsResult.data ?? []) as Row[]).map(
      (row): Mission => ({
        id: String(row.id),
        title: String(row.title),
        prompt: String(row.prompt),
        kind: (row.kind as Mission["kind"]) ?? "action",
        options: (row.options as string[] | null) ?? undefined,
        successMessage: String(row.success_message ?? "You did it."),
        completed: Boolean(row.completed),
      }),
    ),
    reasons: (settingsRow?.love_reasons as string[] | null) ?? demoData.reasons,
  };
}

export async function getAdminData(viewer: Viewer): Promise<AdminData> {
  const data = await getExperienceData(viewer);
  return {
    ...data,
    stats: {
      events: data.events.length,
      pendingReveals: data.surprises.filter(
        (surprise) => surprise.effectiveStatus === "locked",
      ).length,
      memories: data.memories.length,
      publishedLetters: data.letters.filter((letter) => letter.status === "published").length,
    },
  };
}
