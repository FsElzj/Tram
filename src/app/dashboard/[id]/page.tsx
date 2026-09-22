import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase";
import { countryName, flag } from "@/lib/countries";
import { shortUrl } from "@/lib/url";
import { deleteLink } from "../../actions";
import { CopyButton } from "../copy-button";
import { EditForm } from "./edit-form";

export default async function LinkPage(props: PageProps<"/dashboard/[id]">) {
  const { id } = await props.params;
  const { sb, user } = await requireUser();
  if (!user) redirect("/login");

  const [{ data: link }, { data: rows }] = await Promise.all([
    sb.from("links").select("id, slug, destination, title, active, created_at").eq("id", id).maybeSingle(),
    sb.rpc("link_countries", { p_link: id }),
  ]);
  if (!link) notFound();

  const countries = (rows ?? []) as { country: string; total: number }[];
  const total = countries.reduce((s, c) => s + Number(c.total), 0);
  const max = Math.max(1, ...countries.map((c) => Number(c.total)));
  const url = shortUrl(link.slug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{link.title || link.slug}</h1>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-neutral-900 p-2 pl-3">
          <span className="min-w-0 flex-1 truncate font-mono text-sm">{url}</span>
          <CopyButton text={url} />
        </div>
      </div>

      <section className="rounded-xl border border-neutral-800 p-4">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-medium">Visitas por país</h2>
          <p className="text-sm text-neutral-400">
            <span className="text-lg font-semibold text-white tabular-nums">{total}</span> en total
          </p>
        </div>
        {!countries.length ? (
          <p className="py-6 text-center text-sm text-neutral-500">Nadie ha abierto este enlace todavía</p>
        ) : (
          <ol className="space-y-3">
            {countries.map((c, i) => {
              const n = Number(c.total);
              return (
                <li key={c.country}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>
                      <span className="mr-2 text-neutral-500 tabular-nums">{i + 1}.</span>
                      <span className="mr-2">{flag(c.country)}</span>
                      {countryName(c.country)}
                    </span>
                    <span className="tabular-nums text-neutral-300">
                      {n} {n === 1 ? "persona" : "personas"}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-900">
                    <div className="h-full rounded-full bg-white" style={{ width: `${(n / max) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <EditForm id={link.id} destination={link.destination} title={link.title} active={link.active} />

      <form action={deleteLink} className="text-right">
        <input type="hidden" name="id" value={link.id} />
        <button className="text-sm text-red-400 hover:text-red-300">Eliminar enlace</button>
      </form>
    </div>
  );
}
