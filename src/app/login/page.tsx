"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LogIn } from "lucide-react";
import { login } from "../actions";

/**
 * Mismo patrón que la entrada del panel de STEM: el formulario flota sobre la
 * escena, sin tarjeta; los campos son transparentes con solo la línea de abajo
 * y el único sólido es el botón. Cambia la marca: rojo profundo de fondo, rojo
 * vivo en el botón y un rosado claro para los resaltes.
 */

function useMovimientoReducido() {
  const [reducido, setReducido] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducido(mq.matches);
    const on = (e: MediaQueryListEvent) => setReducido(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reducido;
}

/** Partículas que suben, en rosado y muy discretas. */
function Particulas({ apagado }: { apagado: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (apagado) return;
    const lienzo = ref.current;
    const ctx = lienzo?.getContext("2d");
    if (!lienzo || !ctx) return;

    type P = { x: number; y: number; v: number; o: number };
    let ps: P[] = [];
    let raf = 0;
    const nueva = (): P => ({
      x: Math.random() * lienzo.width,
      y: Math.random() * lienzo.height,
      v: Math.random() * 0.22 + 0.05,
      o: Math.random() * 0.3 + 0.08,
    });
    const medir = () => {
      lienzo.width = window.innerWidth;
      lienzo.height = window.innerHeight;
      ps = Array.from({ length: Math.floor((lienzo.width * lienzo.height) / 14000) }, nueva);
    };
    const pintar = () => {
      ctx.clearRect(0, 0, lienzo.width, lienzo.height);
      for (const p of ps) {
        p.y -= p.v;
        if (p.y < 0) {
          p.x = Math.random() * lienzo.width;
          p.y = lienzo.height + 20;
        }
        ctx.fillStyle = `rgba(255, 179, 176, ${p.o})`;
        ctx.fillRect(p.x, p.y, 1, 2.4);
      }
      raf = requestAnimationFrame(pintar);
    };

    medir();
    window.addEventListener("resize", medir);
    raf = requestAnimationFrame(pintar);
    return () => {
      window.removeEventListener("resize", medir);
      cancelAnimationFrame(raf);
    };
  }, [apagado]);

  if (apagado) return null;
  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />;
}

export default function LoginPage() {
  const [state, action, enviando] = useActionState(login, null);
  const [verClave, setVerClave] = useState(false);
  const reducido = useMovimientoReducido();

  // Campo flotante: transparente, solo la línea de abajo; al escribir, rosado.
  const campo =
    "w-full border-0 border-b border-white/25 bg-transparent px-0 py-2.5 text-[15px] text-white " +
    "placeholder:text-white/55 transition-colors focus:border-rosa focus:outline-none disabled:opacity-50";

  return (
    <div className="entrada relative min-h-dvh overflow-hidden bg-rojo-deep">
      {/* Retícula que se dibuja al cargar */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="hline" style={{ top: "14%", animationDelay: ".1s" }} />
        <div className="hline" style={{ top: "86%", animationDelay: ".25s" }} />
        <div className="vline" style={{ left: "15%", animationDelay: ".4s" }} />
        <div className="vline" style={{ left: "85%", animationDelay: ".55s" }} />
      </div>

      <Particulas apagado={reducido} />

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-6">
        <div className="w-full max-w-xs">
          <div className="sube flex items-center justify-center gap-3" style={{ animationDelay: ".1s" }}>
            <span className="flex flex-col gap-1.5" aria-hidden>
              <span className="block h-3.5 w-14 bg-white" />
              <span className="block h-3.5 w-14 bg-rojo" />
            </span>
            <span className="leading-none">
              <span className="block text-[10px] font-semibold tracking-[.22em] text-white">LIDIA LABS</span>
              <span className="block text-3xl font-bold tracking-tight text-white">Links</span>
            </span>
          </div>

          <form action={action} className="mt-14 flex flex-col gap-8">
            <div className="sube" style={{ animationDelay: ".25s" }}>
              <label htmlFor="correo" className="rotulo">Correo electrónico</label>
              <input
                id="correo" name="email" type="email" autoComplete="username" autoFocus required
                disabled={enviando} placeholder="tu@correo.com" className={campo}
              />
            </div>

            <div className="sube" style={{ animationDelay: ".35s" }}>
              <label htmlFor="clave" className="rotulo">Contraseña</label>
              <div className="relative">
                <input
                  id="clave" name="password" type={verClave ? "text" : "password"}
                  autoComplete="current-password" required disabled={enviando}
                  className={`${campo} pr-9`}
                />
                <button
                  type="button" tabIndex={-1} onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? "Ocultar la contraseña" : "Ver la contraseña"}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-white/55 transition-colors hover:text-white focus:outline-none focus-visible:text-rosa"
                >
                  {verClave ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {state?.error && (
              <p role="alert" className="-my-3 text-xs font-medium text-rosa">{state.error}</p>
            )}

            <button
              type="submit" disabled={enviando} style={{ animationDelay: ".45s" }}
              className="sube flex items-center justify-center gap-2 bg-rojo px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-px hover:bg-white hover:text-rojo-deep active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:translate-y-0 disabled:opacity-50"
            >
              {enviando ? <LoaderCircle size={15} className="animate-spin" /> : <LogIn size={15} />}
              {enviando ? "Entrando…" : "Entrar al panel"}
            </button>
          </form>

          <p className="sube mt-12 text-center text-xs text-white/60" style={{ animationDelay: ".55s" }}>
            ¿Sin acceso? Las cuentas las da el equipo de <span className="text-white/80">Lidia Labs</span>.
          </p>
        </div>
      </div>

      <footer className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-6 pb-5 text-center">
        <p className="rotulo !mb-0 !text-white/40">tiktok.lidialabs.com</p>
      </footer>
    </div>
  );
}
