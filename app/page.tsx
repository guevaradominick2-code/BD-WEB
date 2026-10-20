import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
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
  searchParams: Promise<{ error?: string }>;
}) {
  const viewer = await resolveViewer();
  if (viewer) redirect(viewer.role === "admin" ? "/admin" : "/universe");
  const demo = isDemoEnabled();
  const { error } = await searchParams;

  return (
    <main className="login-shell min-h-dvh overflow-hidden">
      <StarField />
      <div className="login-orbit orbit-one" aria-hidden="true" />
      <div className="login-orbit orbit-two" aria-hidden="true" />

      <div className="absolute right-5 top-5 z-20"><ThemeToggle /></div>

      <section className="relative z-10 mx-auto grid min-h-dvh w-full max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:px-12">
        <div className="max-w-2xl text-center lg:text-left">
          <div className="eyebrow mx-auto mb-8 w-fit border-white/15 bg-white/5 text-[#eddcc7] lg:mx-0">
            <Sparkles className="size-3.5" /> A private constellation
          </div>
          <p className="mb-3 font-serif text-xl italic text-[#d9b98f]">For one person only</p>
          <h1 className="font-serif text-[clamp(3.8rem,9vw,8.5rem)] leading-[.78] tracking-[-.055em] text-[#fff9f5]">
            Our little<br /><span className="ml-[.35em] italic text-[#f1cfd8]">universe.</span>
          </h1>
          <p className="mx-auto mt-9 max-w-xl text-base leading-7 text-white/65 lg:mx-0 lg:text-lg">
            Hay un pequeño universo esperando por ti. Un lugar hecho de recuerdos,
            cartas y momentos preparados con todo el amor del mundo.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3 text-xs uppercase tracking-[.24em] text-white/40 lg:justify-start">
            <span className="h-px w-10 bg-[#d9b98f]/50" />
            Made with love · 2026
          </div>
        </div>

        <Card className="relative mx-auto w-full max-w-md overflow-hidden border-white/10 bg-[#fff9f5]/[.97] p-6 shadow-[0_40px_120px_rgba(0,0,0,.35)] md:p-9">
          <div className="absolute -right-14 -top-14 size-36 rounded-full bg-[#f5dde3] blur-3xl" />
          <div className="relative">
            <div className="mb-8 flex items-start justify-between">
              <div className="grid size-12 place-items-center rounded-2xl bg-[#5a2636] text-white shadow-lg">
                <LockKeyhole className="size-5" />
              </div>
              <span className="rounded-full border border-[#5a2636]/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-[#5a2636]/60">
                Private access
              </span>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#9b7957]">Welcome, beautiful</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight text-[#282126]">Este lugar fue creado para una sola persona. Tú.</h2>
            <p className="mt-4 text-sm leading-6 text-[#6f6268]">Ingresa con la invitación privada que recibiste.</p>

            {error ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {decodeURIComponent(error)}
              </div>
            ) : null}

            <form action="/auth/sign-in" method="post" className="mt-7 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[.14em] text-[#75656b]">Email</span>
                <Input name="email" type="email" autoComplete="email" placeholder="tu@email.com" required className="bg-white" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[.14em] text-[#75656b]">Contraseña</span>
                <Input name="password" type="password" autoComplete="current-password" placeholder="••••••••••" required className="bg-white" />
              </label>
              <Button type="submit" size="lg" className="w-full">
                Entrar a nuestro universo <ArrowRight className="size-4" />
              </Button>
            </form>

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
