"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { LockKeyhole, MailOpen, Sparkles } from "lucide-react";
import { useState } from "react";
import { Countdown } from "@/components/experience/countdown";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Surprise } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

export function EnvelopeCard({ surprise, timezone }: { surprise: Surprise; timezone: string }) {
  const [opened, setOpened] = useState(false);
  const locked = surprise.effectiveStatus === "locked";

  if (locked) {
    return (
      <article className="envelope-card group">
        <div className="envelope-visual locked-envelope">
          <div className="envelope-flap" />
          <div className="envelope-seal"><LockKeyhole className="size-4" /></div>
        </div>
        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.22em] text-[var(--champagne-dark)]">{surprise.label}</p>
        <h3 className="mt-2 font-serif text-2xl">{surprise.name}</h3>
        {surprise.hint ? <p className="mt-2 text-sm italic text-[var(--muted)]">“{surprise.hint}”</p> : null}
        <div className="mt-5 border-t border-[color:var(--line)] pt-4">
          <Countdown target={surprise.revealAt} compact />
        </div>
      </article>
    );
  }

  return (
    <Dialog open={opened} onOpenChange={setOpened}>
      <DialogTrigger asChild>
        <button className="envelope-card group w-full text-left" aria-label={`Abrir ${surprise.name}`}>
          <motion.div className="envelope-visual" whileHover={{ y: -5 }}>
            <div className="envelope-flap" />
            <div className="envelope-seal"><Sparkles className="size-4" /></div>
          </motion.div>
          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[.22em] text-[var(--champagne-dark)]">{surprise.label} · Ready</p>
          <h3 className="mt-2 font-serif text-2xl">{surprise.name}</h3>
          <p className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--burgundy)]"><MailOpen className="size-4" /> Open your envelope</p>
        </button>
      </DialogTrigger>
      <DialogContent title={surprise.name} description={formatDateTime(surprise.revealAt, timezone)}>
        <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .15 }}>
          {surprise.imageUrl ? (
            <div className="relative mb-6 aspect-[16/9] overflow-hidden rounded-2xl bg-[#ead6d9]">
              <Image src={surprise.imageUrl} alt="Ilustración temporal de la sorpresa" fill className="object-cover" sizes="(max-width: 640px) 90vw, 560px" />
            </div>
          ) : null}
          <div className="letter-paper rounded-2xl p-6 md:p-8">
            <p className="text-xs uppercase tracking-[.2em] text-[var(--champagne-dark)]">A note for you</p>
            <p className="mt-4 font-serif text-2xl leading-relaxed italic">{surprise.message}</p>
            {surprise.hint ? <p className="mt-6 text-sm text-[var(--muted)]">The first clue: {surprise.hint}</p> : null}
          </div>
          <Button onClick={() => setOpened(false)} className="mt-6 w-full">Keep this moment</Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
