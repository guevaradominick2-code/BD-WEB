"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginInputClass =
  "bg-white text-[#282126] caret-[#5a2636] placeholder:text-[#8a7b81] focus:bg-white";

export function AdminLoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action="/auth/sign-in" method="post" className="mt-7 space-y-4">
      <label className="block">
        <span className="mb-2 block text-xs font-medium uppercase tracking-[.14em] text-[#75656b]">Email</span>
        <Input name="email" type="email" autoComplete="email" placeholder="tu@email.com" required className={loginInputClass} />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-medium uppercase tracking-[.14em] text-[#75656b]">Contraseña</span>
        <span className="relative block">
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••••"
            required
            className={`${loginInputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-2xl text-[#75656b] transition hover:text-[#5a2636] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#5a2636]"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </span>
      </label>

      <Button type="submit" size="lg" className="w-full">Entrar al panel <ArrowRight className="size-4" /></Button>
    </form>
  );
}
