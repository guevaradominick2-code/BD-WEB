import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  const viewer = await resolveViewer();
  if (!viewer || viewer.role !== "girlfriend" || viewer.demo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { wish } = z.object({ wish: z.string().min(1).max(2000) }).parse(await request.json());
  const supabase = await createClient();
  const { data: celebration } = await supabase
    .from("celebrations")
    .select("id")
    .eq("guest_id", viewer.id)
    .limit(1)
    .single();
  if (!celebration) return NextResponse.json({ error: "Celebration not found" }, { status: 404 });
  const { error } = await supabase.from("birthday_wishes").upsert(
    { celebration_id: celebration.id, author_id: viewer.id, wish },
    { onConflict: "celebration_id,author_id" },
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ saved: true });
}
