# Supabase migrations

Tracked SQL for schema/policy changes. This project has **no Supabase CLI linked**, so
migrations are applied **manually**:

1. Open the Supabase dashboard → **SQL Editor**.
2. Paste the contents of each new `*.sql` file (in filename/timestamp order) and run it.

Files are named `YYYYMMDDHHMMSS_description.sql` so they apply in order. Each is written to
be **idempotent** (safe to re-run).

> The full base schema (tables, base RLS, Realtime setup) still lives in the project plan
> file referenced in `CLAUDE.md`; this folder tracks incremental changes made since.
