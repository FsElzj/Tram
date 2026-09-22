-- Esquema de tiktok.looma.studio
-- Pegar completo en Supabase → SQL Editor → Run.
-- Privacidad: por cada visita solo se guarda el código de país (ISO-2) y la fecha.
-- Nunca IP, ciudad, user-agent ni nada que identifique a la persona.

create table if not exists public.links (
  id          uuid primary key default gen_random_uuid(),
  owner       uuid not null default auth.uid() references auth.users(id) on delete cascade,
  slug        text not null unique check (slug ~ '^[A-Za-z0-9]{10}$'),
  destination text not null check (destination ~* '^https?://'),
  title       text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.clicks (
  id         bigint generated always as identity primary key,
  link_id    uuid not null references public.links(id) on delete cascade,
  country    text not null default 'XX' check (country ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default now()
);

create index if not exists clicks_link_country_idx on public.clicks (link_id, country);
create index if not exists links_owner_idx on public.links (owner, created_at desc);

alter table public.links  enable row level security;
alter table public.clicks enable row level security;

-- Cada usuario solo ve y edita sus propios enlaces.
drop policy if exists links_owner_all on public.links;
create policy links_owner_all on public.links
  for all to authenticated
  using (owner = (select auth.uid()))
  with check (owner = (select auth.uid()));

-- Solo el dueño del enlace ve sus visitas. Nadie inserta directo (lo hace resolve_link).
drop policy if exists clicks_owner_select on public.clicks;
create policy clicks_owner_select on public.clicks
  for select to authenticated
  using (exists (select 1 from public.links l where l.id = link_id and l.owner = (select auth.uid())));

-- Punto público: resuelve el slug, registra la visita (si count=true) y devuelve el destino.
-- security definer porque el visitante es anónimo y no puede leer links ni escribir clicks.
create or replace function public.resolve_link(p_slug text, p_country text, p_count boolean default true)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id   uuid;
  v_dest text;
  v_cc   text := upper(coalesce(p_country, ''));
begin
  select id, destination into v_id, v_dest
  from public.links
  where slug = p_slug and active
  limit 1;

  if v_id is null then
    return null;
  end if;

  if p_count then
    if v_cc !~ '^[A-Z]{2}$' then v_cc := 'XX'; end if;
    insert into public.clicks (link_id, country) values (v_id, v_cc);
  end if;

  return v_dest;
end;
$$;

revoke all on function public.resolve_link(text, text, boolean) from public;
grant execute on function public.resolve_link(text, text, boolean) to anon, authenticated;

-- Resumen para el dashboard: total de visitas por enlace (respeta RLS del que llama).
create or replace function public.link_totals()
returns table (link_id uuid, total bigint, countries bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.link_id, count(*), count(distinct c.country)
  from public.clicks c
  group by c.link_id;
$$;

-- Visitas por país de un enlace (respeta RLS del que llama).
create or replace function public.link_countries(p_link uuid)
returns table (country text, total bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select c.country, count(*)
  from public.clicks c
  where c.link_id = p_link
  group by c.country
  order by 2 desc, 1;
$$;

grant execute on function public.link_totals() to authenticated;
grant execute on function public.link_countries(uuid) to authenticated;
