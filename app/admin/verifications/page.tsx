"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface PendingVerification {
  id: string;
  user_id: string;
  method: string;
  status: string;
  document_type: string | null;
  document_url: string | null;
  created_at: string;
}

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState<PendingVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPending();
  }, []);

  async function fetchPending() {
    const supabase = createClient();
    const { data } = await supabase
      .from("user_verifications")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });

    if (data) {
      setVerifications(data);
      // Get signed URLs for document images
      for (const v of data) {
        if (v.document_url) {
          const { data: urlData } = await supabase.storage
            .from("id-documents")
            .createSignedUrl(v.document_url, 3600);
          if (urlData?.signedUrl) {
            setImageUrls((prev) => ({ ...prev, [v.id]: urlData.signedUrl }));
          }
        }
      }
    }
    setLoading(false);
  }

  async function handleAction(userId: string, action: "approve" | "reject") {
    setProcessing(userId);
    const reason = action === "reject" ? prompt("Rejection reason (optional):") : null;

    await fetch("/api/admin/verify-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, reason }),
    });

    setVerifications((prev) => prev.filter((v) => v.user_id !== userId));
    setProcessing(null);
  }

  function timeAgo(dateStr: string) {
    const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0d0916] dark:text-[#ede9f8]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900 dark:text-[#ede9f8]">ID Verifications</h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          Review pending identity document uploads. {verifications.length} pending.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="material-symbols-outlined animate-spin text-3xl text-[#3e0074] dark:text-[#c084fc]">progress_activity</span>
          </div>
        ) : verifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-zinc-300 py-20 dark:border-zinc-700">
            <span className="material-symbols-outlined text-5xl text-zinc-300 dark:text-zinc-600">verified</span>
            <p className="text-sm font-semibold text-zinc-400">No pending verifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((v) => (
              <div key={v.id} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#161027]">
                <div className="flex flex-col gap-6 md:flex-row">
                  {/* Document preview */}
                  <div className="shrink-0">
                    {imageUrls[v.id] ? (
                      <img
                        src={imageUrls[v.id]}
                        alt="ID Document"
                        className="h-48 w-auto rounded-lg border border-zinc-200 object-contain dark:border-zinc-700"
                      />
                    ) : (
                      <div className="flex h-48 w-36 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        <span className="material-symbols-outlined text-3xl text-zinc-300 dark:text-zinc-600">image</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                        Pending
                      </span>
                      <span className="text-[12px] text-zinc-400">{timeAgo(v.created_at)}</span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      <strong className="text-zinc-900 dark:text-[#ede9f8]">User:</strong> {v.user_id.slice(0, 8)}...
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <strong className="text-zinc-900 dark:text-[#ede9f8]">Document:</strong> {v.document_type || "Not specified"}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      <strong className="text-zinc-900 dark:text-[#ede9f8]">Method:</strong> {v.method}
                    </p>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => handleAction(v.user_id, "approve")}
                        disabled={processing === v.user_id}
                        className="rounded-lg bg-emerald-500 px-6 py-2.5 text-[12px] font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60"
                      >
                        {processing === v.user_id ? "…" : "Approve"}
                      </button>
                      <button
                        onClick={() => handleAction(v.user_id, "reject")}
                        disabled={processing === v.user_id}
                        className="rounded-lg border border-red-200 px-6 py-2.5 text-[12px] font-bold text-red-600 transition-all hover:bg-red-50 active:scale-[0.98] disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
