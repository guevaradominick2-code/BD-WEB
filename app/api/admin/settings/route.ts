import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { resolveViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  girlfriend_name: z.string().min(1).max(100),
  birthday: z.string().datetime({ offset: true }),
  timezone: z.string().min(1).max(80),
  hero_message: z.string().min(1).max(200),
  welcome_message: z.string().min(1).max(2000),
  love_reasons: z.array(z.string().min(1).max(500)).max(100).optional(),
});

export async function PATCH(request: NextRequest) {
  const viewer = await resolveViewer();
  if (!viewer || viewer.role !== "admin" || viewer.demo) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const payload = settingsSchema.partial().parse(await request.json());
  const supabase = await createClient();
  const { data: celebration } = await supabase
    .from("celebrations")
    .select("id")
    .eq("owner_id", viewer.id)
    .limit(1)
    .single();
  if (!celebration) return NextResponse.json({ error: "Celebration not found" }, { status: 404 });
  const { data, error } = await supabase
    .from("app_settings")
    .update(payload)
    .eq("celebration_id", celebration.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}
