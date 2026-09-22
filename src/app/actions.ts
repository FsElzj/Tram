"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, supabase } from "@/lib/supabase";
import { newSlug } from "@/lib/slug";

function cleanUrl(raw: FormDataEntryValue | null) {
  let url = String(raw ?? "").trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = "https://" + url;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}

export async function login(_: unknown, form: FormData) {
  const sb = await supabase();
  const { error } = await sb.auth.signInWithPassword({
    email: String(form.get("email") ?? "").trim(),
    password: String(form.get("password") ?? ""),
  });
  if (error) return { error: "Correo o contraseña incorrectos" };
  redirect("/dashboard");
}

export async function logout() {
  const sb = await supabase();
  await sb.auth.signOut();
  redirect("/login");
}

export async function createLink(_: unknown, form: FormData) {
  const { sb, user } = await requireUser();
  if (!user) redirect("/login");

  const destination = cleanUrl(form.get("destination"));
  if (!destination) return { error: "Escribe un enlace válido (https://...)" };
  const title = String(form.get("title") ?? "").trim() || null;

  for (let attempt = 0; attempt < 5; attempt++) {
    const { data, error } = await sb
      .from("links")
      .insert({ slug: newSlug(), destination, title })
      .select("id")
      .single();
    if (!error) {
      revalidatePath("/dashboard");
      redirect(`/dashboard/${data.id}`);
    }
    if (error.code !== "23505") return { error: error.message };
  }
  return { error: "No se pudo generar el enlace, intenta otra vez" };
}

export async function updateLink(_: unknown, form: FormData) {
  const { sb, user } = await requireUser();
  if (!user) redirect("/login");

  const id = String(form.get("id"));
  const destination = cleanUrl(form.get("destination"));
  if (!destination) return { error: "Escribe un enlace válido (https://...)", ok: false };

  const { error } = await sb
    .from("links")
    .update({
      destination,
      title: String(form.get("title") ?? "").trim() || null,
      active: form.get("active") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message, ok: false };
  revalidatePath(`/dashboard/${id}`);
  revalidatePath("/dashboard");
  return { error: null, ok: true };
}

export async function deleteLink(form: FormData) {
  const { sb, user } = await requireUser();
  if (!user) redirect("/login");
  await sb.from("links").delete().eq("id", String(form.get("id")));
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
