"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const RESEND_COOLDOWN_SECONDS = 30;

export function AdminCodeVerifyForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const sentOnce = useRef(false);

  async function sendCode() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-admin-code", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't send the code. Try again.");
      } else {
        setCooldown(RESEND_COOLDOWN_SECONDS);
      }
    } catch {
      setError("Couldn't send the code. Try again.");
    } finally {
      setSending(false);
    }
  }

  useEffect(() => {
    if (sentOnce.current) return;
    sentOnce.current = true;
    sendCode();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-admin-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid or expired code.");
        setVerifying(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setVerifying(false);
    }
  }

  async function handleSignOut() {
    const supabase = createClient();
    await Promise.all([
      supabase.auth.signOut(),
      fetch("/api/auth/clear-admin-mfa", { method: "POST" }),
    ]);
    router.push("/login");
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-center text-2xl font-bold tracking-[0.5em] text-zinc-900 placeholder:text-zinc-300 transition-all duration-200 focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:placeholder:text-zinc-700 dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10";

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#3e0074]/10 dark:bg-[#c084fc]/10">
          <span className="material-symbols-outlined text-2xl text-[#3e0074] dark:text-[#c084fc]">mail</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-3xl">
          Verify it&apos;s you
        </h1>
        <p className="mt-2 font-secondary text-sm text-zinc-500 dark:text-zinc-400">
          {sending
            ? "Sending a code to your email…"
            : <>We sent a 6-digit code to <span className="font-semibold text-zinc-700 dark:text-zinc-300">{email}</span></>}
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#0c0b14]">
        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="------"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            autoFocus
            className={inputClass}
          />

          <button
            type="submit"
            disabled={verifying || code.length !== 6}
            className="w-full rounded-xl bg-[#3e0074] py-4 text-base font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-[#5b21b6] dark:shadow-[0_4px_16px_rgba(91,33,182,0.3)]"
          >
            {verifying ? "Verifying…" : "Verify and continue"}
          </button>

          <button
            type="button"
            onClick={sendCode}
            disabled={sending || cooldown > 0}
            className="w-full text-center text-sm font-semibold text-[#3e0074] transition-colors hover:underline disabled:opacity-50 disabled:no-underline dark:text-[#c084fc]"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
          </button>
        </form>
      </div>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-6 w-full text-center text-sm font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
      >
        Sign out
      </button>
    </div>
  );
}
