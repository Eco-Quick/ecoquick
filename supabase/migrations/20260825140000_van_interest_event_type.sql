alter table public.security_events
  drop constraint if exists security_events_event_type_check;

alter table public.security_events
  add constraint security_events_event_type_check
  check (event_type = ANY (ARRAY['login_attempt'::text, 'signup'::text, 'order_placed'::text, 'van_interest'::text]));
