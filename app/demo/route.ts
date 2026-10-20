import { NextResponse, type NextRequest } from "next/server";
import { isDemoEnabled } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!isDemoEnabled()) return NextResponse.redirect(new URL("/", request.url));
  const role = request.nextUrl.searchParams.get("role");
  if (role !== "admin" && role !== "girlfriend") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const response = NextResponse.redirect(
    new URL(role === "admin" ? "/admin" : "/universe", request.url),
  );
  response.cookies.set("olu_demo_role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return response;
}
