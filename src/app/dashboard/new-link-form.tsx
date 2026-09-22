"use client";

import { useActionState } from "react";
import { createLink } from "../actions";

export function NewLinkForm() {
  const [state, action, pending] = useActionState(createLink, null);
  return (
    <form action={action} className="rounded-xl border border-neutral-800 p-4">
      <p className="mb-3 text-sm font-medium">Nuevo enlace</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input name="destination" required placeholder="¿A dónde redirige? https://www.tiktok.com/@..." className="input" />
        <input name="title" placeholder="Nombre (opcional)" className="input sm:max-w-44" />
        <button disabled={pending} className="btn shrink-0">{pending ? "Creando…" : "Crear"}</button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}
    </form>
  );
}
