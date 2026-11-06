import { NextResponse, type NextRequest } from "next/server";
import { isDemoEnabled } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { ACCESS_COOKIE } from "@/lib/access";

export async function POST(request: NextRequest) {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.delete(ACCESS_COOKIE);
  if (isDemoEnabled()) response.cookies.delete("olu_demo_role");
  return response;
}
