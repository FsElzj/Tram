"use client";

import { useActionState } from "react";
import { login } from "../actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <form action={action} className="w-full max-w-sm space-y-4">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Looma Links</h1>
          <p className="mt-1 text-sm text-neutral-400">Inicia sesión para ver tus enlaces</p>
        </div>
        <input name="email" type="email" required placeholder="Correo" autoComplete="email" className="input" />
        <input name="password" type="password" required placeholder="Contraseña" autoComplete="current-password" className="input" />
        {state?.error && <p className="text-sm text-red-400">{state.error}</p>}
        <button disabled={pending} className="btn w-full">{pending ? "Entrando…" : "Entrar"}</button>
      </form>
    </main>
  );
}
