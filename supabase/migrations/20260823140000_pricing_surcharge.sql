create table if not exists public.pricing_surcharge (
  id uuid primary key default gen_random_uuid(),
  enabled boolean not null default false,
  amount numeric not null default 0 check (amount >= 0),
  reason text,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Single-row config table.
insert into public.pricing_surcharge (enabled, amount, reason)
select false, 0, null
where not exists (select 1 from public.pricing_surcharge);

alter table public.pricing_surcharge enable row level security;
grant select, insert, update on public.pricing_surcharge to service_role;
