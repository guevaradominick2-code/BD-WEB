import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE, createAccessSession, verifyAccessWord } from "@/lib/access";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const word = String(form.get("word") ?? "");

  if (!process.env.ACCESS_WORD || !process.env.ACCESS_SESSION_SECRET) {
    return NextResponse.redirect(new URL("/?error=El%20acceso%20privado%20aún%20no%20está%20configurado", request.url), 303);
  }
  if (!verifyAccessWord(word)) {
    return NextResponse.redirect(new URL("/?error=Esa%20no%20es%20nuestra%20palabra", request.url), 303);
  }

  const session = createAccessSession();
  if (!session) {
    return NextResponse.redirect(new URL("/?error=No%20pudimos%20abrir%20este%20recuerdo", request.url), 303);
  }

  const response = NextResponse.redirect(new URL("/universe", request.url), 303);
  response.cookies.set(ACCESS_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: session.maxAge,
    path: "/",
  });
  return response;
}
