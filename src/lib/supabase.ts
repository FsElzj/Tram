import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function supabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => {
          try {
            list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Llamado desde un Server Component: el proxy ya refresca la sesión.
          }
        },
      },
    },
  );
}

export async function requireUser() {
  const sb = await supabase();
  const { data } = await sb.auth.getUser();
  return { sb, user: data.user };
}
