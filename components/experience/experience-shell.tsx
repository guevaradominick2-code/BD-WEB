"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  Camera,
  Check,
  ChevronRight,
  Compass,
  Gift,
  Heart,
  Home,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Music2,
  PartyPopper,
  Plane,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Countdown } from "@/components/experience/countdown";
import { EnvelopeCard } from "@/components/experience/envelope-card";
import { IntroReveal } from "@/components/experience/intro-reveal";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/input";
import type { ExperienceData, ExperienceEvent, LoveLetter, Viewer } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

type Section = "home" | "birthday" | "memories" | "letters" | "gifts" | "adventure";

const navItems: { id: Section; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "birthday", label: "Birthday", icon: CalendarDays },
  { id: "memories", label: "Memories", icon: Camera },
  { id: "letters", label: "Letters", icon: Mail },
  { id: "gifts", label: "Gifts", icon: Gift },
  { id: "adventure", label: "Adventure", icon: Compass },
];

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="mb-8 max-w-2xl md:mb-12">
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl">{title}</h2>
      <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)] md:text-base">{copy}</p>
    </div>
  );
}

function StatusPill({ event }: { event: ExperienceEvent }) {
  const styles = {
    locked: "bg-black/5 text-[var(--muted)]",
    revealed: "bg-[#ecdfca] text-[#684a2a]",
    completed: "bg-[#dfe9df] text-[#3c5b41]",
  }[event.effectiveStatus];
  return <span className={cn("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em]", styles)}>{event.effectiveStatus}</span>;
}

function EventCard({ event, timezone }: { event: ExperienceEvent; timezone: string }) {
  const locked = event.effectiveStatus === "locked";
  return (
    <Card className={cn("relative overflow-hidden p-5 md:p-7", locked && "bg-[color:var(--surface-muted)]")}>
      <div className="absolute right-0 top-0 font-serif text-[7rem] leading-none text-[var(--burgundy)]/[.035]">{String(event.orderIndex).padStart(2, "0")}</div>
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[var(--champagne-dark)]">{event.category}</p>
            <p className="mt-2 text-sm capitalize text-[var(--muted)]">{formatDate(event.startsAt, timezone)}</p>
          </div>
          <StatusPill event={event} />
        </div>
        <h3 className="mt-6 font-serif text-3xl leading-tight">{event.title}</h3>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{event.teaser}</p>
        {locked ? (
          <>
            {event.clue ? <div className="mt-5 rounded-2xl border border-dashed border-[color:var(--line-strong)] p-4 text-sm italic text-[var(--muted)]">Clue: {event.clue}</div> : null}
            <div className="mt-5"><Countdown target={event.revealAt} compact /></div>
          </>
        ) : (
          <div className="mt-6 space-y-3 border-t border-[color:var(--line)] pt-5 text-sm">
            {event.location ? <p className="flex items-start gap-3"><MapPin className="mt-0.5 size-4 shrink-0 text-[var(--burgundy)]" /><span>{event.location}</span></p> : null}
            {event.meetingTime ? <p className="flex items-start gap-3"><CalendarDays className="mt-0.5 size-4 shrink-0 text-[var(--burgundy)]" /><span>{event.meetingTime}</span></p> : null}
            {event.details ? <p className="leading-6 text-[var(--muted)]">{event.details}</p> : null}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {event.dressCode ? <div className="mini-detail"><span>Dress code</span>{event.dressCode}</div> : null}
              {event.bring ? <div className="mini-detail"><span>What to bring</span>{event.bring}</div> : null}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function LetterCard({ letter, timezone }: { letter: LoveLetter; timezone: string }) {
  if (!letter.unlocked) {
    return (
      <Card className="letter-card p-6 opacity-80">
        <div className="grid size-11 place-items-center rounded-full bg-black/5"><LockKeyhole className="size-4" /></div>
        <p className="mt-6 text-[10px] uppercase tracking-[.2em] text-[var(--champagne-dark)]">Sealed until {formatDate(letter.revealAt, timezone)}</p>
        <h3 className="mt-3 font-serif text-2xl">{letter.title}</h3>
        <p className="mt-3 text-sm italic leading-6 text-[var(--muted)]">{letter.excerpt}</p>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="letter-card rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--surface)] p-6 text-left shadow-[0_20px_60px_rgba(90,38,54,.08)] transition hover:-translate-y-1">
          <div className="grid size-11 place-items-center rounded-full bg-[var(--blush)] text-[var(--burgundy)]"><Mail className="size-4" /></div>
          <p className="mt-6 text-[10px] uppercase tracking-[.2em] text-[var(--champagne-dark)]">Ready to read</p>
          <h3 className="mt-3 font-serif text-2xl">{letter.title}</h3>
          <p className="mt-3 text-sm italic leading-6 text-[var(--muted)]">{letter.excerpt}</p>
          <span className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-[var(--burgundy)]">Open letter <ChevronRight className="size-3.5" /></span>
        </button>
      </DialogTrigger>
      <DialogContent title={letter.title} description="Words I want you to keep">
        <div className="letter-paper rounded-2xl p-6 md:p-9">
          <p className="font-serif text-xl leading-9 italic md:text-2xl">{letter.body}</p>
          <div className="mt-8 flex items-center gap-3 text-xs uppercase tracking-[.18em] text-[var(--champagne-dark)]"><span className="h-px flex-1 bg-[color:var(--line-strong)]" />Always yours</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WishCard({ demo }: { demo: boolean }) {
  const [wish, setWish] = useState("");
  const [saved, setSaved] = useState(false);

  async function save() {
    if (!wish.trim()) return;
    if (demo) {
      window.localStorage.setItem("olu-birthday-wish", wish);
      setSaved(true);
      return;
    }
    const response = await fetch("/api/wish", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ wish }),
    });
    setSaved(response.ok);
  }

  return (
    <Card className="relative overflow-hidden bg-[var(--burgundy)] p-6 text-white md:p-8">
      <Star className="absolute -right-4 -top-4 size-32 text-white/[.04]" />
      <p className="text-[10px] uppercase tracking-[.22em] text-[#d9b98f]">Birthday wish</p>
      <h3 className="mt-3 font-serif text-3xl">Make a wish.</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">Este deseo será privado y podrás cambiarlo cuando quieras.</p>
      <Textarea value={wish} onChange={(event) => { setWish(event.target.value); setSaved(false); }} placeholder="Escribe aquí algo sólo para ti…" className="mt-5 border-white/10 bg-white/[.08] text-white placeholder:text-white/30 focus:border-[#d9b98f]" />
      <Button onClick={save} className="mt-4 bg-[#f5dde3] text-[#5a2636] hover:bg-white">{saved ? <><Check className="size-4" /> Guardado</> : "Guardar mi deseo"}</Button>
    </Card>
  );
}

export function ExperienceShell({ data, viewer }: { data: ExperienceData; viewer: Viewer }) {
  const [section, setSection] = useState<Section>("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reasonIndex, setReasonIndex] = useState(0);
  const [missionDone, setMissionDone] = useState<Record<string, boolean>>({});
  const nextEvent = useMemo(
    () => [...data.events].filter((event) => new Date(event.startsAt) > new Date()).sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0] ?? data.events[0],
    [data.events],
  );
  const pending = data.surprises.filter((surprise) => surprise.effectiveStatus === "locked").length;
  const revealedAdventure = data.events.find((event) => event.category === "Our Adventure");

  function navigate(next: Section) {
    setSection(next);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
      <IntroReveal name={data.settings.girlfriendName} />
      {viewer.demo ? <div className="demo-banner">Modo demostración · datos ficticios · los cambios se guardan sólo en este dispositivo</div> : null}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-8 backdrop-blur-xl lg:flex lg:flex-col">
        <div>
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-[var(--burgundy)] text-white"><Heart className="size-4 fill-current" /></div>
            <div><p className="font-serif text-xl leading-none">Our little universe</p><p className="mt-1 text-[9px] uppercase tracking-[.2em] text-[var(--muted)]">Made only for you</p></div>
          </div>
          <nav className="mt-12 space-y-1" aria-label="Navegación principal">
            {navItems.map((item) => <NavButton key={item.id} item={item} active={section === item.id} onClick={() => navigate(item.id)} />)}
          </nav>
        </div>
        <div className="mt-auto rounded-3xl bg-[var(--burgundy)] p-5 text-white">
          <p className="text-[9px] uppercase tracking-[.2em] text-[#d9b98f]">Next moment</p>
          <p className="mt-2 font-serif text-xl">{nextEvent?.teaser}</p>
          {nextEvent ? <div className="mt-4"><Countdown target={nextEvent.startsAt} compact /></div> : null}
        </div>
        <form action="/auth/signout" method="post" className="mt-4"><button className="w-full py-2 text-xs text-[var(--muted)] hover:text-[var(--ink)]">Cerrar este universo</button></form>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[color:var(--line)] bg-[color:var(--paper-translucent)] px-5 py-4 backdrop-blur-xl lg:ml-72 lg:px-9">
        <button onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded-full border border-[color:var(--line)] lg:hidden" aria-label="Abrir menú"><Menu className="size-4" /></button>
        <div className="hidden lg:block"><p className="text-xs uppercase tracking-[.18em] text-[var(--muted)]">{navItems.find((item) => item.id === section)?.label}</p></div>
        <div className="flex items-center gap-3">
          <Button variant="icon" aria-label="Música no configurada" title="Configura una pista en el panel"><Music2 className="size-4" /></Button>
          <ThemeToggle />
          <button onClick={() => navigate("gifts")} className="relative grid size-10 place-items-center rounded-full bg-[var(--blush)] text-[var(--burgundy)]" aria-label="Ver sorpresas"><Gift className="size-4" />{pending ? <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[var(--burgundy)] text-[9px] text-white">{pending}</span> : null}</button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div className="fixed inset-0 z-50 bg-[#1a1117]/60 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.aside className="h-full w-[85%] max-w-sm bg-[var(--paper)] p-6" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28 }}>
              <div className="mb-10 flex items-center justify-between"><p className="font-serif text-2xl">Our little universe</p><button onClick={() => setMenuOpen(false)} className="grid size-10 place-items-center rounded-full border border-[color:var(--line)]"><X className="size-4" /></button></div>
              <nav className="space-y-2">{navItems.map((item) => <NavButton key={item.id} item={item} active={section === item.id} onClick={() => navigate(item.id)} />)}</nav>
              <form action="/auth/signout" method="post" className="mt-8"><Button type="submit" variant="secondary" className="w-full">Cerrar sesión</Button></form>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="pb-28 lg:ml-72 lg:pb-12">
        <AnimatePresence mode="wait">
          <motion.div key={section} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .35 }}>
            {section === "home" ? (
              <div>
                <section className="home-hero relative min-h-[72dvh] overflow-hidden px-5 py-16 md:px-10 md:py-24">
                  <div className="hero-glow" />
                  <div className="relative z-10 mx-auto max-w-6xl">
                    <div className="eyebrow w-fit"><Sparkles className="size-3.5" /> Your private constellation</div>
                    <p className="mt-10 font-serif text-lg italic text-[var(--champagne-dark)]">Welcome back, beautiful</p>
                    <h1 className="mt-3 max-w-4xl font-serif text-[clamp(3.6rem,9vw,8rem)] leading-[.86] tracking-[-.055em]">Happy Birthday,<br /><span className="ml-[.16em] italic text-[var(--burgundy)]">My Love.</span></h1>
                    <p className="mt-8 max-w-xl text-base leading-8 text-[var(--muted)]">{data.settings.welcomeMessage}</p>
                    <div className="mt-9 flex flex-wrap gap-3"><Button onClick={() => navigate("birthday")} size="lg">Explore your universe <ChevronRight className="size-4" /></Button><Button onClick={() => navigate("memories")} size="lg" variant="secondary">Our memories</Button></div>
                  </div>
                  <button className="easter-heart" aria-label="Mensaje secreto" onClick={() => setReasonIndex((reasonIndex + 1) % data.reasons.length)}><Heart className="size-4 fill-current" /><span>{data.reasons[reasonIndex]}</span></button>
                </section>

                <section className="mx-auto -mt-8 grid max-w-6xl gap-4 px-5 md:grid-cols-[1.2fr_.8fr] md:px-10">
                  <Card className="p-6 md:p-8"><div className="flex items-center justify-between"><p className="section-eyebrow">Our next adventure begins in</p><Plane className="size-5 text-[var(--burgundy)]" /></div>{nextEvent ? <><h2 className="mt-4 font-serif text-3xl">{nextEvent.teaser}</h2><div className="mt-7"><Countdown target={nextEvent.startsAt} /></div></> : null}</Card>
                  <Card className="flex flex-col justify-between bg-[var(--burgundy)] p-6 text-white md:p-8"><div><p className="text-[10px] uppercase tracking-[.2em] text-[#d9b98f]">Waiting for you</p><p className="mt-3 font-serif text-5xl">{pending}</p><p className="mt-1 text-sm text-white/60">surprises are still sealed.</p></div><button onClick={() => navigate("gifts")} className="mt-6 flex items-center justify-between border-t border-white/10 pt-5 text-sm">Discover your gifts <ChevronRight className="size-4" /></button></Card>
                </section>

                <section className="mx-auto max-w-6xl px-5 py-20 md:px-10"><div className="grid items-center gap-10 md:grid-cols-2"><div className="relative aspect-[4/5] overflow-hidden rounded-[2.25rem] bg-[var(--blush)]"><Image src={data.memories.find((memory) => memory.featured)?.imageUrl ?? data.memories[0]?.imageUrl} alt="Recuerdo destacado temporal" fill className="object-cover" sizes="(max-width: 768px) 90vw, 45vw" /><div className="absolute inset-x-4 bottom-4 rounded-2xl bg-black/35 p-4 text-white backdrop-blur"><p className="text-[9px] uppercase tracking-[.2em] text-white/60">Memory of the day</p><p className="mt-1 font-serif text-xl">{data.memories.find((memory) => memory.featured)?.title}</p></div></div><div><p className="section-eyebrow">A love note for today</p><blockquote className="mt-5 font-serif text-4xl leading-tight italic md:text-5xl">“{data.reasons[reasonIndex]}”</blockquote><Button variant="secondary" className="mt-8" onClick={() => setReasonIndex((reasonIndex + 1) % data.reasons.length)}>Need a little love? <Heart className="size-4" /></Button></div></div></section>
              </div>
            ) : null}

            {section === "birthday" ? (
              <section className="page-section"><SectionHeading eyebrow="Your birthday · November 2026" title="A calendar made of little promises." copy="Cada fecha guarda una parte de la celebración. Los detalles aparecen sólo cuando llega el momento correcto." /><div className="calendar-line grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.events.map((event) => <EventCard key={event.id} event={event} timezone={data.settings.timezone} />)}</div><div className="mt-10"><WishCard demo={viewer.demo} /></div></section>
            ) : null}

            {section === "memories" ? (
              <section className="page-section"><SectionHeading eyebrow="Our memories" title="The days I keep coming back to." copy="Una colección viva de esos instantes que merecen quedarse cerca. Las ilustraciones actuales son marcadores para reemplazar con sus fotografías." /><div className="memory-grid">{data.memories.map((memory, index) => <Dialog key={memory.id}><DialogTrigger asChild><button className={cn("polaroid text-left", index % 3 === 1 && "polaroid-tilt-right", index % 3 === 2 && "polaroid-tilt-left")}><div className="relative aspect-[4/5] overflow-hidden bg-[var(--blush)]"><Image src={memory.imageUrl} alt={memory.title} fill className="object-cover transition duration-700 hover:scale-105" sizes="(max-width: 640px) 85vw, 30vw" /></div><p className="mt-4 font-serif text-2xl">{memory.title}</p><p className="mt-1 text-xs uppercase tracking-[.14em] text-[var(--muted)]">{memory.category}</p></button></DialogTrigger><DialogContent title={memory.title} description={memory.place ?? memory.category}><div className="relative aspect-[4/3] overflow-hidden rounded-2xl"><Image src={memory.imageUrl} alt={memory.title} fill className="object-cover" sizes="560px" /></div><p className="mt-5 text-sm leading-7 text-[var(--muted)]">{memory.description}</p><blockquote className="mt-5 border-l-2 border-[var(--champagne)] pl-4 font-serif text-xl italic">{memory.romanticNote}</blockquote></DialogContent></Dialog>)}</div></section>
            ) : null}

            {section === "letters" ? (
              <section className="page-section"><SectionHeading eyebrow="Words I want you to keep" title="Letters for every version of us." copy="Algunas palabras están listas. Otras esperan una fecha especial antes de dejarse leer." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.letters.map((letter) => <LetterCard key={letter.id} letter={letter} timezone={data.settings.timezone} />)}</div></section>
            ) : null}

            {section === "gifts" ? (
              <section className="page-section"><SectionHeading eyebrow="Your gifts" title="Sealed with a little mystery." copy="Cada sobre tiene su propio momento. Cuando llegue, el sello desaparecerá y la carta será tuya." /><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{data.surprises.map((surprise) => <EnvelopeCard key={surprise.id} surprise={surprise} timezone={data.settings.timezone} />)}</div></section>
            ) : null}

            {section === "adventure" ? (
              <section className="page-section"><SectionHeading eyebrow="Our adventure" title="The world feels closer with you." copy="Una invitación para el próximo capítulo, acompañada de pequeñas misiones para entrar en ambiente." />
                <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
                  <Card className="boarding-pass overflow-hidden p-0"><div className="grid md:grid-cols-[1fr_auto]"><div className="p-7 md:p-10"><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[.24em] text-[var(--champagne-dark)]">Our little universe air</span><Plane className="size-5 text-[var(--burgundy)]" /></div><p className="mt-12 text-xs uppercase tracking-[.18em] text-[var(--muted)]">Admit one</p><h3 className="mt-2 font-serif text-4xl md:text-6xl">{revealedAdventure?.effectiveStatus === "locked" ? "Destination: a mystery" : revealedAdventure?.title}</h3><p className="mt-4 max-w-xl text-sm leading-7 text-[var(--muted)]">An unforgettable adventure with your favorite person.</p><div className="mt-10 grid grid-cols-2 gap-5 border-t border-dashed border-[color:var(--line-strong)] pt-6 md:grid-cols-4"><TicketDetail label="Passenger" value={data.settings.girlfriendName} /><TicketDetail label="Date" value={revealedAdventure ? formatDate(revealedAdventure.startsAt, data.settings.timezone) : "TBA"} /><TicketDetail label="Gate" value="LOVE" /><TicketDetail label="Seat" value="TOGETHER" /></div></div><div className="boarding-stub grid min-h-48 place-items-center border-t border-dashed border-[color:var(--line-strong)] p-8 md:w-52 md:border-l md:border-t-0"><div className="text-center"><div className="mx-auto grid size-16 place-items-center rounded-full border border-[var(--champagne)]"><Plane className="size-6" /></div><p className="mt-4 text-[9px] uppercase tracking-[.2em] text-[var(--muted)]">OLU · 2026</p></div></div></div></Card>
                  <Card className="p-6 md:p-8"><p className="section-eyebrow">Secret missions</p><div className="mt-5 space-y-4">{data.missions.map((mission) => <div key={mission.id} className="rounded-2xl border border-[color:var(--line)] p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] uppercase tracking-[.18em] text-[var(--champagne-dark)]">{mission.title}</p><p className="mt-2 font-serif text-xl">{mission.prompt}</p></div>{missionDone[mission.id] ? <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#dfe9df] text-[#3c5b41]"><Check className="size-4" /></span> : null}</div>{mission.options && !missionDone[mission.id] ? <div className="mt-4 flex flex-wrap gap-2">{mission.options.map((option) => <button key={option} onClick={() => setMissionDone((current) => ({ ...current, [mission.id]: true }))} className="rounded-full border border-[color:var(--line-strong)] px-3 py-2 text-xs transition hover:border-[var(--burgundy)] hover:text-[var(--burgundy)]">{option}</button>)}</div> : null}{mission.kind === "action" && !missionDone[mission.id] ? <Button variant="secondary" size="sm" className="mt-4" onClick={() => setMissionDone((current) => ({ ...current, [mission.id]: true }))}>I found it</Button> : null}{missionDone[mission.id] ? <p className="mt-3 text-sm italic text-[var(--muted)]">{mission.successMessage}</p> : null}</div>)}</div></Card>
                </div>
                <div className="mt-8 rounded-[2rem] bg-[var(--burgundy)] px-6 py-12 text-center text-white md:px-12 md:py-16"><PartyPopper className="mx-auto size-8 text-[#d9b98f]" /><p className="mt-5 text-xs uppercase tracking-[.24em] text-[#d9b98f]">After the celebration</p><h3 className="mt-3 font-serif text-4xl md:text-6xl">Thank you for being you.</h3><p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/60">Cuando termine el cumpleaños, este espacio seguirá aquí para guardar lo que vivimos y volver a sentirlo juntos.</p></div>
              </section>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-[1.4rem] border border-white/20 bg-[#2b1d25]/95 px-1 py-2 text-white shadow-2xl backdrop-blur-xl lg:hidden" aria-label="Navegación móvil">
        {navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => navigate(item.id)} className={cn("flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[8px] uppercase tracking-[.08em] text-white/45 transition", section === item.id && "bg-white/10 text-[#f5dde3]")}><Icon className="size-4" /><span className="truncate">{item.label}</span></button>; })}
      </nav>
    </div>
  );
}

function NavButton({ item, active, onClick }: { item: (typeof navItems)[number]; active: boolean; onClick: () => void }) {
  const Icon = item.icon;
  return <button onClick={onClick} className={cn("flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition", active ? "bg-[var(--burgundy)] text-white shadow-lg" : "text-[var(--muted)] hover:bg-[color:var(--surface-strong)] hover:text-[var(--ink)]")}><Icon className="size-4" /><span>{item.label}</span>{active ? <span className="ml-auto size-1.5 rounded-full bg-[#d9b98f]" /> : null}</button>;
}

function TicketDetail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[8px] font-semibold uppercase tracking-[.18em] text-[var(--muted)]">{label}</p><p className="mt-1 font-serif text-base capitalize">{value}</p></div>;
}
