import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Previsualizadores (TikTok, WhatsApp, Facebook, etc.) abren el enlace para armar la tarjeta.
// Se les redirige igual, pero no cuentan como visita.
const BOTS = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|embedly|curl|wget|python|headless|lighthouse|bytespider/i;

// Se crea al primer request, no al cargar el módulo: en el build no hay variables de entorno.
let client: SupabaseClient | null = null;
function sb() {
  client ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { persistSession: false },
  });
  return client;
}

export async function GET(request: NextRequest, ctx: RouteContext<"/videos/[slug]">) {
  const { slug } = await ctx.params;
  if (!/^[A-Za-z0-9]{10}$/.test(slug)) return notFound();

  // Solo el país. La IP nunca se lee ni se guarda.
  const country =
    request.headers.get("x-vercel-ip-country") ?? request.headers.get("cf-ipcountry") ?? "XX";
  const count = !BOTS.test(request.headers.get("user-agent") ?? "") && request.method === "GET";

  const { data: destination, error } = await sb().rpc("resolve_link", {
    p_slug: slug,
    p_country: country,
    p_count: count,
  });

  if (error || !destination) return notFound();

  const res = NextResponse.redirect(destination as string, 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}

export const HEAD = GET;

function notFound() {
  return new NextResponse("Enlace no encontrado", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
