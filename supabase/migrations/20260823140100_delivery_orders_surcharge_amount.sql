alter table public.delivery_orders
  add column if not exists surcharge_amount numeric not null default 0;

comment on column public.delivery_orders.surcharge_amount is
  'Weather/demand surcharge applied at booking time, from pricing_surcharge if enabled. Included in total_price.';
