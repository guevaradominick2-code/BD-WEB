import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/?error=Supabase%20no%20está%20configurado", request.url),
      303,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return NextResponse.redirect(
      new URL("/?error=No%20pudimos%20abrir%20este%20universo", request.url),
      303,
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  return NextResponse.redirect(
    new URL(profile?.role === "admin" ? "/admin" : "/universe", request.url),
    303,
  );
}
