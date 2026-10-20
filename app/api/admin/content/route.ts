import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const resourceSchema = z.enum(["events", "surprises", "letters"]);

const eventSchema = z.object({
  title: z.string().min(1).max(120),
  teaser: z.string().min(1).max(240),
  category: z.string().min(1).max(80),
  starts_at: z.string().datetime({ offset: true }),
  ends_at: z.string().datetime({ offset: true }).nullable().optional(),
  reveal_at: z.string().datetime({ offset: true }),
  status: z.enum(["locked", "revealed", "completed"]),
  clue: z.string().max(500).nullable().optional(),
  location: z.string().max(300).nullable().optional(),
  meeting_time: z.string().max(120).nullable().optional(),
  dress_code: z.string().max(200).nullable().optional(),
  bring: z.string().max(500).nullable().optional(),
  details: z.string().max(5000).nullable().optional(),
  gratitude: z.string().max(1000).nullable().optional(),
  order_index: z.number().int().min(0),
});

const surpriseSchema = z.object({
  name: z.string().min(1).max(120),
  label: z.string().min(1).max(80),
  reveal_at: z.string().datetime({ offset: true }),
  event_date: z.string().datetime({ offset: true }).nullable().optional(),
  status: z.enum(["locked", "revealed", "completed"]),
  hint: z.string().max(500).nullable().optional(),
  message: z.string().max(5000).nullable().optional(),
  image_url: z.string().max(1000).nullable().optional(),
  order_index: z.number().int().min(0),
});

const letterSchema = z.object({
  title: z.string().min(1).max(160),
  excerpt: z.string().min(1).max(300),
  body: z.string().max(20000).nullable().optional(),
  reveal_at: z.string().datetime({ offset: true }),
  status: z.enum(["draft", "published"]),
  order_index: z.number().int().min(0),
});

const schemas = { events: eventSchema, surprises: surpriseSchema, letters: letterSchema };

async function adminContext() {
  const viewer = await resolveViewer();
  if (!viewer || viewer.role !== "admin" || viewer.demo) return null;
  const supabase = await createClient();
  const { data: celebration } = await supabase
    .from("celebrations")
    .select("id")
    .eq("owner_id", viewer.id)
    .limit(1)
    .single();
  if (!celebration) return null;
  return { supabase, celebrationId: celebration.id as string };
}

export async function POST(request: NextRequest) {
  const context = await adminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const resource = resourceSchema.parse(body.resource);
  const payload = schemas[resource].parse(body.payload);
  const { data, error } = await context.supabase
    .from(resource)
    .insert({ ...payload, celebration_id: context.celebrationId })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const context = await adminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const resource = resourceSchema.parse(body.resource);
  const id = z.string().uuid().parse(body.id);
  const payload = schemas[resource].partial().parse(body.payload);
  const { data, error } = await context.supabase
    .from(resource)
    .update(payload)
    .eq("id", id)
    .eq("celebration_id", context.celebrationId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const context = await adminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const resource = resourceSchema.parse(request.nextUrl.searchParams.get("resource"));
  const id = z.string().uuid().parse(request.nextUrl.searchParams.get("id"));
  const { error } = await context.supabase
    .from(resource)
    .delete()
    .eq("id", id)
    .eq("celebration_id", context.celebrationId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return new NextResponse(null, { status: 204 });
}
