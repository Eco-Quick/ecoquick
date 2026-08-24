create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  session_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_session_id_idx on public.page_views (session_id);

alter table public.page_views enable row level security;
grant select, insert on public.page_views to service_role;

create table if not exists public.error_log (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  message text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists error_log_created_at_idx on public.error_log (created_at desc);

alter table public.error_log enable row level security;
grant select, insert on public.error_log to service_role;
