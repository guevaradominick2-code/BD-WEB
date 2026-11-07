import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const memoryIdSchema = z.string().uuid();
const memoryUpdateSchema = z.object({
  title: z.string().min(1).max(140),
  category: z.string().min(1).max(80),
  description: z.string().max(2000),
  romantic_note: z.string().max(1000),
  memory_date: z.union([z.string().date(), z.null()]),
  place: z.union([z.string().max(200), z.null()]),
  featured: z.boolean(),
});

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
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !IMAGE_TYPES.has(file.type) || file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Use JPEG, PNG, WebP or AVIF up to 8 MB." }, { status: 400 });
  }
  const title = z.string().min(1).max(140).parse(form.get("title"));
  const category = z.string().min(1).max(80).parse(form.get("category"));
  const description = z.string().max(2000).parse(form.get("description") ?? "");
  const romanticNote = z.string().max(1000).parse(form.get("romanticNote") ?? "");
  const fileBytes = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", fileBytes);
  const contentHash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");

  const { supabase, celebrationId } = context;

  const { data: duplicate } = await supabase
    .from("memories")
    .select("id")
    .eq("celebration_id", celebrationId)
    .eq("content_hash", contentHash)
    .maybeSingle();
  if (duplicate) {
    return NextResponse.json(
      { error: "Esta imagen ya fue subida a la galería." },
      { status: 409 },
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `${celebrationId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("memories")
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  const { data, error } = await supabase
    .from("memories")
    .insert({
      celebration_id: celebrationId,
      title,
      category,
      description,
      romantic_note: romanticNote,
      storage_path: storagePath,
      content_hash: contentHash,
      published: true,
    })
    .select()
    .single();
  if (error) {
    await supabase.storage.from("memories").remove([storagePath]);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const context = await adminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = memoryIdSchema.parse(request.nextUrl.searchParams.get("id"));
  const payload = memoryUpdateSchema.parse(await request.json());
  const { supabase, celebrationId } = context;

  if (payload.featured) {
    const { error: resetError } = await supabase
      .from("memories")
      .update({ featured: false })
      .eq("celebration_id", celebrationId)
      .neq("id", id);
    if (resetError) return NextResponse.json({ error: resetError.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("memories")
    .update(payload)
    .eq("id", id)
    .eq("celebration_id", celebrationId)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

export async function DELETE(request: NextRequest) {
  const context = await adminContext();
  if (!context) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = memoryIdSchema.parse(request.nextUrl.searchParams.get("id"));
  const { supabase, celebrationId } = context;
  const { data: memory, error: readError } = await supabase
    .from("memories")
    .select("storage_path")
    .eq("id", id)
    .eq("celebration_id", celebrationId)
    .single();
  if (readError || !memory) {
    return NextResponse.json({ error: "Fotografía no encontrada." }, { status: 404 });
  }

  if (memory.storage_path) {
    const { error: storageError } = await supabase.storage
      .from("memories")
      .remove([memory.storage_path]);
    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 400 });
    }
  }

  const { error } = await supabase
    .from("memories")
    .delete()
    .eq("id", id)
    .eq("celebration_id", celebrationId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return new NextResponse(null, { status: 204 });
}
