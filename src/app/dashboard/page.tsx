import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/supabase";
import { shortUrl } from "@/lib/url";
import { NewLinkForm } from "./new-link-form";
import { CopyButton } from "./copy-button";

export default async function Dashboard() {
  const { sb, user } = await requireUser();
  if (!user) redirect("/login");

  const [{ data: links }, { data: totals }] = await Promise.all([
    sb.from("links").select("id, slug, destination, title, active, created_at").order("created_at", { ascending: false }),
    sb.rpc("link_totals"),
  ]);
  type Total = { link_id: string; total: number; countries: number };
  const byLink = new Map(((totals ?? []) as Total[]).map((t) => [t.link_id, t]));

  return (
    <div className="space-y-6">
      <NewLinkForm />
      {!links?.length ? (
        <p className="py-12 text-center text-sm text-neutral-500">Todavía no tienes enlaces</p>
      ) : (
        <ul className="divide-y divide-neutral-900 rounded-xl border border-neutral-800">
          {links.map((l) => {
            const t = byLink.get(l.id);
            const url = shortUrl(l.slug);
            return (
              <li key={l.id} className="flex items-center gap-3 p-4">
                <Link href={`/dashboard/${l.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {l.title || l.slug}
                    {!l.active && <span className="ml-2 text-xs text-amber-400">pausado</span>}
                  </p>
                  <p className="truncate font-mono text-xs text-neutral-400">{url.replace(/^https:\/\//, "")}</p>
                  <p className="truncate text-xs text-neutral-500">→ {l.destination}</p>
                </Link>
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums">{t?.total ?? 0}</p>
                  <p className="text-xs text-neutral-500">{t?.countries ?? 0} países</p>
                </div>
                <CopyButton text={url} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
