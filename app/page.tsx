import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin-login-form";
import { StarField } from "@/components/star-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { isDemoEnabled, resolveViewer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; admin?: string }>;
}) {
  const { error, admin } = await searchParams;
  const adminMode = admin === "1";
  const viewer = await resolveViewer();
  if (viewer?.role === "admin") redirect("/admin");
  if (viewer && !adminMode) redirect("/universe");
  const demo = isDemoEnabled();

  return (
    <main className="login-shell min-h-dvh overflow-hidden">
      <StarField />
      <div className="login-orbit orbit-one" aria-hidden="true" />
      <div className="login-orbit orbit-two" aria-hidden="true" />

      <div className="absolute right-5 top-5 z-20"><ThemeToggle /></div>

      <section className="relative z-10 mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:px-12">
        <div className="max-w-2xl text-center lg:text-left">
          <div className="eyebrow mx-auto mb-8 w-fit border-white/15 bg-white/5 text-[#eddcc7] lg:mx-0">
            <Sparkles className="size-3.5" /> Una experiencia privada
          </div>
          <p className="mb-3 font-serif text-xl italic text-[#d9b98f]">Para una persona extraordinaria</p>
          <h1 className="font-serif text-[clamp(3.8rem,9vw,8.5rem)] leading-[.78] tracking-[-.055em] text-[#fff9f5]">
            María,<br /><span className="ml-[.18em] italic text-[#f1cfd8]">esto es para ti.</span>
          </h1>
          <p className="mx-auto mt-9 max-w-xl text-base leading-7 text-white/65 lg:mx-0 lg:text-lg">
            Hay días especiales… y luego está el tuyo. Este lugar está hecho de recuerdos,
            cartas y momentos preparados con todo el amor del mundo.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 text-xs uppercase tracking-[.24em] text-white/40 lg:justify-start">
            <span className="h-px w-10 bg-[#d9b98f]/50" />
            A Birthday Experience · 2026
          </div>
        </div>

        <Card className="relative mx-auto w-full max-w-md overflow-hidden border-white/10 bg-[#fff9f5]/[.97] p-6 shadow-[0_40px_120px_rgba(0,0,0,.35)] md:p-9">
          <div className="absolute -right-14 -top-14 size-36 rounded-full bg-[#f5dde3] blur-3xl" />
          <div className="relative">
            <div className="mb-8 flex items-start justify-between">
              <div className="grid size-12 place-items-center rounded-2xl bg-[#5a2636] text-white shadow-lg">
                {adminMode ? <LockKeyhole className="size-5" /> : <KeyRound className="size-5" />}
              </div>
              <span className="rounded-full border border-[#5a2636]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-[#5a2636]/60">
                {adminMode ? "Administración" : "Sólo nosotros"}
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#9b7957]">{adminMode ? "Panel privado" : "Bienvenida, María"}</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-[#282126]">{adminMode ? "Administra cada detalle de la experiencia." : "Hay una palabra que sólo nosotros conocemos."}</h2>
            <p className="mt-4 text-sm leading-6 text-[#6f6268]">{adminMode ? "Accede con tu cuenta administrativa." : "Escríbela exactamente como la recuerdas para comenzar nuestra historia."}</p>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {decodeURIComponent(error)}
              </div>
            ) : null}

            {adminMode ? (
              <AdminLoginForm />
            ) : (
              <form action="/auth/access" method="post" className="mt-7 space-y-4">
                <label className="block"><span className="mb-2 block text-xs font-medium uppercase tracking-[.14em] text-[#75656b]">Nuestra palabra</span><Input name="word" type="password" autoComplete="off" placeholder="Una palabra muy nuestra…" required className="bg-white text-center font-serif text-lg text-[#282126] caret-[#5a2636] tracking-[.08em] placeholder:text-[#8a7b81] focus:bg-white" /></label>
                <Button type="submit" size="lg" className="w-full">Comenzar nuestra historia <ArrowRight className="size-4" /></Button>
              </form>
            )}

            <div className="mt-5 text-center"><a href={adminMode ? "/" : "/?admin=1"} className="text-[10px] uppercase tracking-[.16em] text-[#75656b] underline-offset-4 hover:underline">{adminMode ? "Volver a la entrada de María" : "Acceso administrativo"}</a></div>

            {demo ? (
              <div className="mt-7 border-t border-[#5a2636]/10 pt-6">
                <div className="mb-4 flex items-center gap-2 text-xs leading-5 text-[#7c6a71]">
                  <ShieldCheck className="size-4 shrink-0 text-[#8c6a45]" />
                  Modo demostración local · contenido ficticio
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button asChild variant="secondary" size="sm"><a href="/demo?role=girlfriend">Ver experiencia</a></Button>
                  <Button asChild variant="secondary" size="sm"><a href="/demo?role=admin">Ver panel admin</a></Button>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </section>
    </main>
  );
}
