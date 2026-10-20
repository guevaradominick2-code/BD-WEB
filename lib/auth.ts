import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Role, Viewer } from "@/lib/types";

export function isDemoEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" &&
    !isSupabaseConfigured()
  );
}

export async function resolveViewer(): Promise<Viewer | null> {
  if (isDemoEnabled()) {
    const cookieStore = await cookies();
    const roleValue = cookieStore.get("olu_demo_role")?.value;
    if (roleValue !== "admin" && roleValue !== "girlfriend") return null;
    return {
      id: `demo-${roleValue}`,
      role: roleValue,
      displayName: roleValue === "admin" ? "Admin" : "My Love",
      demo: true,
    };
  }

  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "girlfriend")) {
    return null;
  }

  return {
    id: user.id,
    role: profile.role as Role,
    displayName: profile.display_name ?? "My Love",
    demo: false,
  };
}

export async function requireViewer(role?: Role) {
  const viewer = await resolveViewer();
  if (!viewer) redirect("/");
  if (role && viewer.role !== role) redirect("/universe");
  return viewer;
}
