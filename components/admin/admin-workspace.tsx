"use client";

import Image from "next/image";
import {
  CalendarClock,
  Camera,
  ChevronRight,
  Eye,
  FileText,
  Gift,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Palette,
  PenLine,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { effectiveStatus } from "@/lib/reveal";
import type { AdminData, ExperienceEvent, LoveLetter, Surprise, Viewer } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

type AdminSection = "dashboard" | "events" | "surprises" | "photos" | "letters" | "personalization" | "preview";

const adminNav: { id: AdminSection; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "events", label: "Events", icon: CalendarClock },
  { id: "surprises", label: "Surprises", icon: Gift },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "letters", label: "Letters", icon: FileText },
  { id: "personalization", label: "Personalization", icon: Palette },
  { id: "preview", label: "Preview", icon: Eye },
];

const fieldClass = "h-12 w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface)] px-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--champagne)]";

function AdminHeading({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="section-eyebrow">Celebration control room</p><h1 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">{title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">{copy}</p></div>{action}</div>;
}

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={cn("block", full && "md:col-span-2")}><span className="mb-2 block text-[10px] font-semibold uppercase tracking-[.16em] text-[var(--muted)]">{label}</span>{children}</label>;
}

export function AdminWorkspace({ initialData, viewer }: { initialData: AdminData; viewer: Viewer }) {
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [events, setEvents] = useState(initialData.events);
  const [surprises, setSurprises] = useState(initialData.surprises);
  const [letters, setLetters] = useState(initialData.letters);
  const [eventEditor, setEventEditor] = useState<{ open: boolean; value?: ExperienceEvent }>({ open: false });
  const [surpriseEditor, setSurpriseEditor] = useState<{ open: boolean; value?: Surprise }>({ open: false });
  const [letterEditor, setLetterEditor] = useState<{ open: boolean; value?: LoveLetter }>({ open: false });
  const [notice, setNotice] = useState<string | null>(null);

  async function mutate(resource: "events" | "surprises" | "letters", method: "POST" | "PATCH" | "DELETE", payload?: Record<string, unknown>, id?: string) {
    if (viewer.demo) return true;
    const url = method === "DELETE" ? `/api/admin/content?resource=${resource}&id=${id}` : "/api/admin/content";
    const response = await fetch(url, {
      method,
      headers: method === "DELETE" ? undefined : { "content-type": "application/json" },
      body: method === "DELETE" ? undefined : JSON.stringify({ resource, id, payload }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({ error: "No se pudo guardar." }));
      setNotice(result.error ?? "No se pudo guardar.");
      return false;
    }
    window.location.reload();
    return true;
  }

  function navigate(next: AdminSection) { setSection(next); setMenuOpen(false); }

  async function deleteResource(resource: "events" | "surprises" | "letters", id: string) {
    if (!window.confirm("¿Eliminar este elemento?")) return;
    if (viewer.demo) {
      if (resource === "events") setEvents((items) => items.filter((item) => item.id !== id));
      if (resource === "surprises") setSurprises((items) => items.filter((item) => item.id !== id));
      if (resource === "letters") setLetters((items) => items.filter((item) => item.id !== id));
      setNotice("Cambio aplicado en la demostración local.");
      return;
    }
    await mutate(resource, "DELETE", undefined, id);
  }

  return (
    <div className="min-h-dvh bg-[#f4efec] text-[#282126] dark:bg-[var(--paper)] dark:text-[var(--ink)]">
      {viewer.demo ? <div className="demo-banner">Modo demostración · los cambios de esta sesión no se enviarán a una base de datos</div> : null}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-[#24171e] p-6 text-white lg:flex">
        <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#f5dde3] text-[#5a2636]"><Heart className="size-4 fill-current" /></div><div><p className="font-serif text-xl">Our little universe</p><p className="text-[9px] uppercase tracking-[.2em] text-white/35">Administration</p></div></div>
        <nav className="mt-10 space-y-1">{adminNav.map((item) => <AdminNavButton key={item.id} item={item} active={section === item.id} onClick={() => navigate(item.id)} />)}</nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[.04] p-4"><p className="text-[9px] uppercase tracking-[.18em] text-[#d9b98f]">Signed in as</p><p className="mt-2 text-sm">{viewer.displayName}</p><p className="text-xs text-white/40">Administrator</p></div>
        <form action="/auth/signout" method="post" className="mt-3"><button className="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-sm text-white/45 hover:bg-white/5 hover:text-white"><LogOut className="size-4" /> Sign out</button></form>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-[#f4efec]/90 px-5 py-4 backdrop-blur-xl lg:ml-72 lg:px-8 dark:bg-[var(--paper-translucent)]">
        <button className="grid size-10 place-items-center rounded-full border border-black/10 lg:hidden" onClick={() => setMenuOpen(true)}><Menu className="size-4" /></button>
        <div className="hidden text-xs uppercase tracking-[.18em] text-[#7c6d73] lg:block">{adminNav.find((item) => item.id === section)?.label}</div>
        <div className="flex items-center gap-3"><Button asChild variant="secondary" size="sm"><a href="/universe"><Eye className="size-4" /> View experience</a></Button><ThemeToggle /></div>
      </header>

      {menuOpen ? <div className="fixed inset-0 z-50 bg-black/55 lg:hidden"><aside className="h-full w-[84%] max-w-sm bg-[#24171e] p-6 text-white"><div className="mb-8 flex items-center justify-between"><p className="font-serif text-2xl">Administration</p><button onClick={() => setMenuOpen(false)}><X /></button></div>{adminNav.map((item) => <AdminNavButton key={item.id} item={item} active={section === item.id} onClick={() => navigate(item.id)} />)}</aside></div> : null}

      <main className="p-5 pb-20 lg:ml-72 lg:p-10">
        {notice ? <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#d9b98f]/40 bg-[#fff7e9] px-4 py-3 text-sm text-[#684a2a]"><span>{notice}</span><button onClick={() => setNotice(null)}><X className="size-4" /></button></div> : null}

        {section === "dashboard" ? <Dashboard data={{ ...initialData, events, surprises, letters }} onNavigate={navigate} /> : null}
        {section === "events" ? <EventsManager events={events} timezone={initialData.settings.timezone} onCreate={() => setEventEditor({ open: true })} onEdit={(value) => setEventEditor({ open: true, value })} onDelete={(id) => deleteResource("events", id)} /> : null}
        {section === "surprises" ? <SurprisesManager surprises={surprises} timezone={initialData.settings.timezone} onCreate={() => setSurpriseEditor({ open: true })} onEdit={(value) => setSurpriseEditor({ open: true, value })} onDelete={(id) => deleteResource("surprises", id)} /> : null}
        {section === "letters" ? <LettersManager letters={letters} timezone={initialData.settings.timezone} onCreate={() => setLetterEditor({ open: true })} onEdit={(value) => setLetterEditor({ open: true, value })} onDelete={(id) => deleteResource("letters", id)} /> : null}
        {section === "photos" ? <PhotoManager data={initialData} demo={viewer.demo} onNotice={setNotice} /> : null}
        {section === "personalization" ? <Personalization settings={initialData.settings} demo={viewer.demo} onNotice={setNotice} /> : null}
        {section === "preview" ? <PreviewSimulator data={{ ...initialData, events, surprises, letters }} /> : null}
      </main>

      <EventEditor open={eventEditor.open} value={eventEditor.value} onOpenChange={(open) => setEventEditor({ open, value: open ? eventEditor.value : undefined })} onSave={async (payload, view) => { if (viewer.demo) { setEvents((items) => view.id ? items.map((item) => item.id === view.id ? view : item) : [...items, { ...view, id: `demo-event-${Date.now()}` }]); setNotice("Evento guardado en esta demostración."); setEventEditor({ open: false }); return; } if (await mutate("events", view.id ? "PATCH" : "POST", payload, view.id)) setEventEditor({ open: false }); }} />
      <SurpriseEditor open={surpriseEditor.open} value={surpriseEditor.value} onOpenChange={(open) => setSurpriseEditor({ open, value: open ? surpriseEditor.value : undefined })} onSave={async (payload, view) => { if (viewer.demo) { setSurprises((items) => view.id ? items.map((item) => item.id === view.id ? view : item) : [...items, { ...view, id: `demo-surprise-${Date.now()}` }]); setNotice("Sorpresa guardada en esta demostración."); setSurpriseEditor({ open: false }); return; } if (await mutate("surprises", view.id ? "PATCH" : "POST", payload, view.id)) setSurpriseEditor({ open: false }); }} />
      <LetterEditor open={letterEditor.open} value={letterEditor.value} onOpenChange={(open) => setLetterEditor({ open, value: open ? letterEditor.value : undefined })} onSave={async (payload, view) => { if (viewer.demo) { setLetters((items) => view.id ? items.map((item) => item.id === view.id ? view : item) : [...items, { ...view, id: `demo-letter-${Date.now()}` }]); setNotice("Carta guardada en esta demostración."); setLetterEditor({ open: false }); return; } if (await mutate("letters", view.id ? "PATCH" : "POST", payload, view.id)) setLetterEditor({ open: false }); }} />
    </div>
  );
}

function AdminNavButton({ item, active, onClick }: { item: (typeof adminNav)[number]; active: boolean; onClick: () => void }) { const Icon = item.icon; return <button onClick={onClick} className={cn("mb-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition", active ? "bg-white/10 text-white" : "text-white/45 hover:bg-white/5 hover:text-white")}><Icon className="size-4" />{item.label}{active ? <ChevronRight className="ml-auto size-3.5" /> : null}</button>; }

function Dashboard({ data, onNavigate }: { data: AdminData; onNavigate: (section: AdminSection) => void }) {
  const stats: Array<[number, string, LucideIcon, AdminSection]> = [
    [data.events.length, "Scheduled events", CalendarClock, "events" as const],
    [data.surprises.filter((item) => item.effectiveStatus === "locked").length, "Pending reveals", Gift, "surprises" as const],
    [data.memories.length, "Memories", Camera, "photos" as const],
    [data.letters.filter((item) => item.status === "published").length, "Published letters", FileText, "letters" as const],
  ];
  return <><AdminHeading title="Everything, in one place." copy="Administra el ritmo de la celebración sin tocar el código. Las fechas y los estados se verifican también en el servidor." action={<Button onClick={() => onNavigate("events")}><Plus className="size-4" /> New event</Button>} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([value, label, Icon, target]) => <button key={label as string} onClick={() => onNavigate(target as AdminSection)} className="rounded-[1.5rem] border border-black/5 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-[color:var(--line)] dark:bg-[color:var(--surface)]"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-[#f5dde3] text-[#5a2636]"><Icon className="size-4" /></span><ChevronRight className="size-4 text-black/20" /></div><p className="mt-6 font-serif text-4xl">{value}</p><p className="mt-1 text-xs uppercase tracking-[.12em] text-[#7c6d73]">{label as string}</p></button>)}</div><div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><Card className="bg-white p-6 dark:bg-[color:var(--surface)]"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl">Upcoming reveals</h2><button onClick={() => onNavigate("surprises")} className="text-xs text-[#5a2636]">Manage all</button></div><div className="mt-5 space-y-3">{data.surprises.slice(0,4).map((item) => <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-[#f7f2ef] p-4 dark:bg-[color:var(--surface-strong)]"><span className="grid size-10 place-items-center rounded-full bg-white text-[#5a2636]"><Gift className="size-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{item.name}</p><p className="mt-1 text-xs text-[#87767d]">{formatDateTime(item.revealAt, data.settings.timezone)}</p></div><span className="rounded-full bg-black/5 px-3 py-1 text-[9px] uppercase tracking-[.12em]">{item.effectiveStatus}</span></div>)}</div></Card><Card className="bg-[#5a2636] p-7 text-white"><Sparkles className="size-6 text-[#d9b98f]" /><h2 className="mt-8 font-serif text-3xl">Preview safely.</h2><p className="mt-3 text-sm leading-6 text-white/55">Simula cualquier fecha para comprobar qué se revelaría. No cambia el reloj real ni publica contenido.</p><Button onClick={() => onNavigate("preview")} className="mt-8 bg-[#f5dde3] text-[#5a2636] hover:bg-white">Open preview <Eye className="size-4" /></Button></Card></div></>;
}

function EventsManager({ events, timezone, onCreate, onEdit, onDelete }: { events: ExperienceEvent[]; timezone: string; onCreate: () => void; onEdit: (event: ExperienceEvent) => void; onDelete: (id: string) => void }) {
  return <><AdminHeading title="Events manager" copy="Crea actividades, cambia fechas, controla la revelación y completa la información logística." action={<Button onClick={onCreate}><Plus className="size-4" /> New event</Button>} /><div className="space-y-4">{events.map((event) => <Card key={event.id} className="bg-white p-5 dark:bg-[color:var(--surface)]"><div className="flex flex-col gap-5 md:flex-row md:items-center"><div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#f5dde3] font-serif text-2xl text-[#5a2636]">{event.orderIndex}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-2xl">{event.title}</h3><span className="rounded-full bg-black/5 px-3 py-1 text-[9px] uppercase tracking-[.14em]">{event.status}</span></div><p className="mt-2 text-sm text-[#7c6d73]">{formatDateTime(event.startsAt, timezone)} · Reveal {formatDateTime(event.revealAt, timezone)}</p></div><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => onEdit(event)}><PenLine className="size-4" /> Edit</Button><Button variant="ghost" size="sm" onClick={() => onDelete(event.id)} aria-label={`Eliminar ${event.title}`}><Trash2 className="size-4" /></Button></div></div></Card>)}</div></>;
}

function SurprisesManager({ surprises, timezone, onCreate, onEdit, onDelete }: { surprises: Surprise[]; timezone: string; onCreate: () => void; onEdit: (item: Surprise) => void; onDelete: (id: string) => void }) { return <><AdminHeading title="Surprises manager" copy="Configura cada sobre, su pista y el instante exacto en que se abre." action={<Button onClick={onCreate}><Plus className="size-4" /> New envelope</Button>} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{surprises.map((item) => <Card key={item.id} className="bg-white p-5 dark:bg-[color:var(--surface)]"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-full bg-[#f5dde3] text-[#5a2636]"><Gift className="size-4" /></span><span className="rounded-full bg-black/5 px-3 py-1 text-[9px] uppercase tracking-[.14em]">{item.status}</span></div><p className="mt-6 text-[9px] uppercase tracking-[.18em] text-[#8d6b46]">{item.label}</p><h3 className="mt-2 font-serif text-2xl">{item.name}</h3><p className="mt-3 text-sm text-[#7c6d73]">{formatDateTime(item.revealAt, timezone)}</p><div className="mt-6 flex gap-2 border-t border-black/5 pt-4"><Button variant="secondary" size="sm" onClick={() => onEdit(item)}><PenLine className="size-4" /> Edit</Button><Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}><Trash2 className="size-4" /></Button></div></Card>)}</div></>; }

function LettersManager({ letters, timezone, onCreate, onEdit, onDelete }: { letters: LoveLetter[]; timezone: string; onCreate: () => void; onEdit: (item: LoveLetter) => void; onDelete: (id: string) => void }) { return <><AdminHeading title="Letters manager" copy="Escribe, guarda borradores y programa las palabras que aparecerán en cada momento." action={<Button onClick={onCreate}><Plus className="size-4" /> New letter</Button>} /><div className="space-y-4">{letters.map((item) => <Card key={item.id} className="bg-white p-5 dark:bg-[color:var(--surface)]"><div className="flex flex-col gap-4 md:flex-row md:items-center"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f5dde3] text-[#5a2636]"><FileText className="size-4" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-serif text-xl">{item.title}</h3><span className="rounded-full bg-black/5 px-3 py-1 text-[9px] uppercase tracking-[.12em]">{item.status}</span></div><p className="mt-1 truncate text-sm text-[#7c6d73]">{item.excerpt}</p><p className="mt-1 text-xs text-[#9a8b91]">{formatDateTime(item.revealAt, timezone)}</p></div><div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => onEdit(item)}><PenLine className="size-4" /> Edit</Button><Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}><Trash2 className="size-4" /></Button></div></div></Card>)}</div></>; }

function PhotoManager({ data, demo, onNotice }: { data: AdminData; demo: boolean; onNotice: (value: string) => void }) {
  async function upload(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (demo) { onNotice("La carga real se habilita al conectar Supabase Storage."); return; } const response = await fetch("/api/admin/memories", { method: "POST", body: new FormData(event.currentTarget) }); if (response.ok) window.location.reload(); else onNotice((await response.json()).error ?? "No se pudo subir la imagen."); }
  return <><AdminHeading title="Photo manager" copy="Sube imágenes a un bucket privado. Se validan el tipo y el tamaño antes de guardar cada recuerdo." /><Card className="mb-8 bg-white p-6 dark:bg-[color:var(--surface)]"><form onSubmit={upload} className="grid gap-4 md:grid-cols-2"><Field label="Photo"><Input name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" required /></Field><Field label="Title"><Input name="title" placeholder="Our favorite afternoon" required /></Field><Field label="Category"><Input name="category" placeholder="Favorite Memories" required /></Field><Field label="Description"><Input name="description" placeholder="What happened that day…" /></Field><Field label="Romantic note" full><Textarea name="romanticNote" placeholder="A note she will see with this memory…" /></Field><div className="md:col-span-2"><Button type="submit"><Upload className="size-4" /> Upload private photo</Button><span className="ml-4 text-xs text-[#7c6d73]">JPEG, PNG, WebP or AVIF · max. 8 MB</span></div></form></Card><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{data.memories.map((memory) => <Card key={memory.id} className="overflow-hidden bg-white dark:bg-[color:var(--surface)]"><div className="relative aspect-square"><Image src={memory.imageUrl} alt={memory.title} fill className="object-cover" sizes="300px" /></div><div className="p-4"><p className="font-serif text-xl">{memory.title}</p><p className="mt-1 text-xs text-[#7c6d73]">{memory.category}</p></div></Card>)}</div></>;
}

function Personalization({ settings, demo, onNotice }: { settings: AdminData["settings"]; demo: boolean; onNotice: (value: string) => void }) {
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const payload = { girlfriend_name: form.get("girlfriend_name"), birthday: form.get("birthday"), timezone: form.get("timezone"), hero_message: form.get("hero_message"), welcome_message: form.get("welcome_message") }; if (demo) { onNotice("Personalización guardada para la demostración. Con Supabase, estos valores persisten para ambos usuarios."); return; } const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); if (response.ok) window.location.reload(); else onNotice((await response.json()).error ?? "No se pudo guardar."); }
  return <><AdminHeading title="Personalization" copy="Ajusta el nombre, el mensaje principal, el cumpleaños y la zona horaria sin editar código." /><Card className="max-w-3xl bg-white p-6 dark:bg-[color:var(--surface)] md:p-8"><form onSubmit={save} className="grid gap-5 md:grid-cols-2"><Field label="Her name"><Input name="girlfriend_name" defaultValue={settings.girlfriendName} required /></Field><Field label="Birthday (ISO 8601 with offset)"><Input name="birthday" defaultValue={settings.birthday} required /></Field><Field label="Timezone"><Input name="timezone" defaultValue={settings.timezone} required /></Field><Field label="Hero title"><Input name="hero_message" defaultValue={settings.heroMessage} required /></Field><Field label="Welcome message" full><Textarea name="welcome_message" defaultValue={settings.welcomeMessage} required /></Field><div className="md:col-span-2"><Button type="submit"><Save className="size-4" /> Save personalization</Button></div></form></Card></>;
}

function PreviewSimulator({ data }: { data: AdminData }) {
  const [previewTime, setPreviewTime] = useState("2026-11-08T12:00");
  const instant = useMemo(() => new Date(previewTime), [previewTime]);
  return <><AdminHeading title="Safe preview" copy="Elige una fecha hipotética para ver los estados calculados. Esta herramienta no modifica el reloj, las fechas reales ni las reglas del servidor." /><Card className="mb-7 bg-white p-6 dark:bg-[color:var(--surface)]"><Field label="Simulated local date and time"><Input type="datetime-local" value={previewTime} onChange={(event) => setPreviewTime(event.target.value)} /></Field></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.events.map((event) => { const status = effectiveStatus(event.status, event.revealAt, instant); return <Card key={event.id} className="bg-white p-5 dark:bg-[color:var(--surface)]"><div className="flex items-center justify-between"><span className="text-[9px] uppercase tracking-[.18em] text-[#8d6b46]">{event.category}</span><span className={cn("rounded-full px-3 py-1 text-[9px] uppercase tracking-[.12em]", status === "locked" ? "bg-black/5" : "bg-[#dfe9df] text-[#3c5b41]")}>{status}</span></div><h3 className="mt-5 font-serif text-2xl">{status === "locked" ? "Something special is waiting…" : event.title}</h3><p className="mt-2 text-sm text-[#7c6d73]">{status === "locked" ? event.clue : event.details}</p></Card>; })}</div></>;
}

function EventEditor({ open, value, onOpenChange, onSave }: { open: boolean; value?: ExperienceEvent; onOpenChange: (open: boolean) => void; onSave: (payload: Record<string, unknown>, view: ExperienceEvent) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const payload = Object.fromEntries(form.entries()) as Record<string, string>; const normalized = { ...payload, ends_at: payload.ends_at || null, clue: payload.clue || null, location: payload.location || null, meeting_time: payload.meeting_time || null, dress_code: payload.dress_code || null, bring: payload.bring || null, details: payload.details || null, gratitude: null, order_index: Number(payload.order_index) }; const view: ExperienceEvent = { id: value?.id ?? "", title: payload.title, teaser: payload.teaser, category: payload.category, startsAt: payload.starts_at, endsAt: payload.ends_at || null, revealAt: payload.reveal_at, status: payload.status as ExperienceEvent["status"], effectiveStatus: payload.status as ExperienceEvent["status"], clue: payload.clue || null, location: payload.location || null, meetingTime: payload.meeting_time || null, dressCode: payload.dress_code || null, bring: payload.bring || null, details: payload.details || null, gratitude: null, orderIndex: Number(payload.order_index) }; onSave(normalized, view); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent title={value ? "Edit event" : "Create event"} description="Use ISO 8601 timestamps with an explicit offset, for example 2026-11-08T10:00:00-06:00."><form onSubmit={submit} className="grid gap-4 md:grid-cols-2"><Field label="Title"><Input name="title" defaultValue={value?.title} required /></Field><Field label="Category"><Input name="category" defaultValue={value?.category ?? "Quality Time"} required /></Field><Field label="Teaser" full><Input name="teaser" defaultValue={value?.teaser} required /></Field><Field label="Starts at"><Input name="starts_at" defaultValue={value?.startsAt ?? "2026-11-08T10:00:00-06:00"} required /></Field><Field label="Ends at"><Input name="ends_at" defaultValue={value?.endsAt ?? ""} /></Field><Field label="Reveal at"><Input name="reveal_at" defaultValue={value?.revealAt ?? "2026-11-07T09:00:00-06:00"} required /></Field><Field label="Status"><select name="status" defaultValue={value?.status ?? "locked"} className={fieldClass}><option value="locked">Locked</option><option value="revealed">Revealed</option><option value="completed">Completed</option></select></Field><Field label="Clue"><Input name="clue" defaultValue={value?.clue ?? ""} /></Field><Field label="Location"><Input name="location" defaultValue={value?.location ?? ""} /></Field><Field label="Meeting time"><Input name="meeting_time" defaultValue={value?.meetingTime ?? ""} /></Field><Field label="Dress code"><Input name="dress_code" defaultValue={value?.dressCode ?? ""} /></Field><Field label="What to bring"><Input name="bring" defaultValue={value?.bring ?? ""} /></Field><Field label="Order"><Input name="order_index" type="number" defaultValue={value?.orderIndex ?? 1} min="0" required /></Field><Field label="Details" full><Textarea name="details" defaultValue={value?.details ?? ""} /></Field><div className="md:col-span-2"><Button type="submit" className="w-full"><Save className="size-4" /> Save event</Button></div></form></DialogContent></Dialog>;
}

function SurpriseEditor({ open, value, onOpenChange, onSave }: { open: boolean; value?: Surprise; onOpenChange: (open: boolean) => void; onSave: (payload: Record<string, unknown>, view: Surprise) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const p = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>; const payload = { ...p, event_date: p.event_date || null, hint: p.hint || null, message: p.message || null, image_url: p.image_url || null, order_index: Number(p.order_index) }; onSave(payload, { id: value?.id ?? "", name: p.name, label: p.label, revealAt: p.reveal_at, eventDate: p.event_date || null, status: p.status as Surprise["status"], effectiveStatus: p.status as Surprise["status"], hint: p.hint || null, message: p.message || null, imageUrl: p.image_url || null, orderIndex: Number(p.order_index) }); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent title={value ? "Edit envelope" : "Create envelope"} description="The message is never returned to the guest before this reveal instant."><form onSubmit={submit} className="grid gap-4 md:grid-cols-2"><Field label="Name"><Input name="name" defaultValue={value?.name} required /></Field><Field label="Label"><Input name="label" defaultValue={value?.label ?? "Envelope"} required /></Field><Field label="Reveal at"><Input name="reveal_at" defaultValue={value?.revealAt ?? "2026-11-07T09:00:00-06:00"} required /></Field><Field label="Event date"><Input name="event_date" defaultValue={value?.eventDate ?? ""} /></Field><Field label="Status"><select name="status" defaultValue={value?.status ?? "locked"} className={fieldClass}><option value="locked">Locked</option><option value="revealed">Revealed</option><option value="completed">Completed</option></select></Field><Field label="Order"><Input name="order_index" type="number" defaultValue={value?.orderIndex ?? 1} min="0" /></Field><Field label="Hint" full><Input name="hint" defaultValue={value?.hint ?? ""} /></Field><Field label="Message" full><Textarea name="message" defaultValue={value?.message ?? ""} /></Field><Field label="Image URL" full><Input name="image_url" defaultValue={value?.imageUrl ?? ""} /></Field><div className="md:col-span-2"><Button type="submit" className="w-full"><Save className="size-4" /> Save envelope</Button></div></form></DialogContent></Dialog>;
}

function LetterEditor({ open, value, onOpenChange, onSave }: { open: boolean; value?: LoveLetter; onOpenChange: (open: boolean) => void; onSave: (payload: Record<string, unknown>, view: LoveLetter) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const p = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>; const payload = { ...p, body: p.body || null, order_index: Number(p.order_index) }; onSave(payload, { id: value?.id ?? "", title: p.title, excerpt: p.excerpt, body: p.body || null, revealAt: p.reveal_at, status: p.status as LoveLetter["status"], unlocked: p.status === "published" && +new Date(p.reveal_at) <= Date.now(), read: false, orderIndex: Number(p.order_index) }); }
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent title={value ? "Edit letter" : "Write a letter"} description="Drafts remain private. Published letters appear only after their reveal time."><form onSubmit={submit} className="grid gap-4 md:grid-cols-2"><Field label="Title"><Input name="title" defaultValue={value?.title} required /></Field><Field label="Status"><select name="status" defaultValue={value?.status ?? "draft"} className={fieldClass}><option value="draft">Draft</option><option value="published">Published</option></select></Field><Field label="Excerpt" full><Input name="excerpt" defaultValue={value?.excerpt} required /></Field><Field label="Reveal at"><Input name="reveal_at" defaultValue={value?.revealAt ?? "2026-11-08T00:01:00-06:00"} required /></Field><Field label="Order"><Input name="order_index" type="number" defaultValue={value?.orderIndex ?? 1} min="0" /></Field><Field label="Letter" full><Textarea name="body" defaultValue={value?.body ?? ""} className="min-h-56" /></Field><div className="md:col-span-2"><Button type="submit" className="w-full"><Save className="size-4" /> Save letter</Button></div></form></DialogContent></Dialog>;
}
