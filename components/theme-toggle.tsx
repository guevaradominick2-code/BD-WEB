"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = window.localStorage.getItem("olu-theme");
      const shouldUseDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
      document.documentElement.dataset.theme = shouldUseDark ? "dark" : "light";
      setDark(shouldUseDark);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    window.localStorage.setItem("olu-theme", next ? "dark" : "light");
  }

  return (
    <Button variant="icon" onClick={toggle} aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}>
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
