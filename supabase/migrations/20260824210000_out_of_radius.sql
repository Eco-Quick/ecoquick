alter table public.delivery_orders
  add column if not exists out_of_radius boolean not null default false;

comment on column public.delivery_orders.out_of_radius is
  'True when pickup or dropoff is beyond the 8-mile Kingston upon Thames service radius. Order still goes through for manual coordination rather than being blocked, to capture expansion-demand signal.';
