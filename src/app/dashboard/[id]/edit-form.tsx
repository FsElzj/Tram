"use client";

import { useActionState } from "react";
import { updateLink } from "../../actions";

type Props = { id: string; destination: string; title: string | null; active: boolean };

export function EditForm({ id, destination, title, active }: Props) {
  const [state, action, pending] = useActionState(updateLink, null);
  return (
    <form action={action} className="space-y-3 rounded-xl border border-neutral-800 p-4">
      <input type="hidden" name="id" value={id} />
      <label className="block space-y-1">
        <span className="text-xs text-neutral-400">Redirige a</span>
        <input name="destination" defaultValue={destination} required className="input" />
      </label>
      <label className="block space-y-1">
        <span className="text-xs text-neutral-400">Nombre</span>
        <input name="title" defaultValue={title ?? ""} placeholder="Ej. Gato feliz" className="input" />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={active} className="size-4 accent-white" />
        Activo
      </label>
      <div className="flex items-center gap-3">
        <button disabled={pending} className="btn">{pending ? "Guardando…" : "Guardar"}</button>
        {state?.ok && <span className="text-sm text-emerald-400">Guardado</span>}
        {state?.error && <span className="text-sm text-red-400">{state.error}</span>}
      </div>
    </form>
  );
}
