"use client";

import { AnimatePresence, motion } from "motion/react";
import { Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function IntroReveal({ name }: { name: string }) {
  const [visible, setVisible] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (window.sessionStorage.getItem("olu-intro-seen")) return;
    const timers = [
      window.setTimeout(() => setVisible(true), 0),
      window.setTimeout(() => setStage(1), 650),
      window.setTimeout(() => setStage(2), 1800),
      window.setTimeout(() => setStage(3), 3000),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, []);

  function close() {
    window.sessionStorage.setItem("olu-intro-seen", "true");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#140d12] px-6 text-center text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 intro-aurora" />
          <div className="relative flex max-w-2xl flex-col items-center">
            <motion.div
              className="grid size-20 place-items-center"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              {stage < 2 ? (
                <Sparkles className="size-8 text-[#d9b98f] drop-shadow-[0_0_20px_#d9b98f]" />
              ) : (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                  <Heart className="size-12 fill-[#dba8b5] text-[#dba8b5] drop-shadow-[0_0_30px_#b85672]" />
                </motion.div>
              )}
            </motion.div>

            {stage >= 2 ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 text-xs font-semibold uppercase tracking-[.35em] text-[#d9b98f]"
              >
                For {name}
              </motion.p>
            ) : null}
            {stage >= 3 ? (
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}>
                <h2 className="mt-5 font-serif text-5xl leading-none tracking-tight md:text-7xl">Happy Birthday,<br /><span className="italic text-[#f1cfd8]">my love.</span></h2>
                <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-white/60">Preparé un universo pequeño, pero lleno de momentos para nosotros.</p>
                <Button onClick={close} className="mt-8 bg-[#f5dde3] text-[#5a2636] hover:bg-white">Descubre lo que preparé</Button>
              </motion.div>
            ) : null}
          </div>
          <button onClick={close} className="absolute bottom-8 text-xs uppercase tracking-[.2em] text-white/35 hover:text-white/70">Saltar intro</button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
