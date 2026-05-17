import { createServiceClient } from "@/lib/supabase/service";
import { VerificationActions } from "./VerificationActions";

export const dynamic = "force-dynamic";

type Verification = {
  id: string;
  user_id: string;
  method: string;
  status: string;
  document_type: string | null;
  document_url: string | null;
  created_at: string;
};

type Enriched = Verification & {
  signedUrl: string | null;
  userEmail: string | null;
  userName: string | null;
};

function timeAgo(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

async function getPending(): Promise<Enriched[]> {
  const service = createServiceClient();
  const { data } = await service
    .from("user_verifications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as Verification[];

  return Promise.all(
    rows.map(async (v) => {
      const [signed, user] = await Promise.all([
        v.document_url
          ? service.storage.from("id-documents").createSignedUrl(v.document_url, 3600)
          : Promise.resolve({ data: null }),
        service.auth.admin.getUserById(v.user_id),
      ]);
      return {
        ...v,
        signedUrl: signed?.data?.signedUrl ?? null,
        userEmail: user.data?.user?.email ?? null,
        userName: (user.data?.user?.user_metadata?.full_name as string) ?? null,
      };
    })
  );
}

export default async function AdminVerificationsPage() {
  const verifications = await getPending();

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Trust &amp; Safety
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          ID VERIFICATIONS
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
          {verifications.length} pending review
        </p>
      </div>

      {verifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-200 py-20 dark:border-zinc-700">
          <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-zinc-600">
            verified
          </span>
          <p className="text-sm font-semibold text-slate-400">
            No pending verifications
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {verifications.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#0c0b14]"
            >
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="shrink-0">
                  {v.signedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.signedUrl}
                      alt="ID Document"
                      className="h-48 w-auto rounded-lg border border-slate-200 object-contain dark:border-zinc-700"
                    />
                  ) : (
                    <div className="flex h-48 w-36 items-center justify-center rounded-lg bg-slate-100 dark:bg-zinc-800">
                      <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-zinc-600">
                        image
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                      Pending
                    </span>
                    <span className="text-[12px] text-slate-400">
                      {timeAgo(v.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-[#ede9f8]">
                    {v.userName ?? "—"}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
                    {v.userEmail ?? "—"}
                  </p>
                  <p className="mt-3 text-[12px] text-slate-500 dark:text-zinc-400">
                    <strong className="text-slate-900 dark:text-[#ede9f8]">
                      Document:
                    </strong>{" "}
                    {v.document_type || "Not specified"}
                  </p>
                  <p className="mt-1 text-[12px] text-slate-500 dark:text-zinc-400">
                    <strong className="text-slate-900 dark:text-[#ede9f8]">
                      Method:
                    </strong>{" "}
                    {v.method}
                  </p>

                  <VerificationActions userId={v.user_id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
