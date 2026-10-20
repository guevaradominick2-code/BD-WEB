import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(request: NextRequest) {
  const viewer = await resolveViewer();
  if (!viewer || viewer.role !== "admin" || viewer.demo) {
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

  const supabase = await createClient();
  const { data: celebration } = await supabase
    .from("celebrations")
    .select("id")
    .eq("owner_id", viewer.id)
    .limit(1)
    .single();
  if (!celebration) return NextResponse.json({ error: "Celebration not found" }, { status: 404 });

  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `${celebration.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("memories")
    .upload(storagePath, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  const { data, error } = await supabase
    .from("memories")
    .insert({
      celebration_id: celebration.id,
      title,
      category,
      description,
      romantic_note: romanticNote,
      storage_path: storagePath,
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
