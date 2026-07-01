"use client";

import Link from "next/link";

/**
 * Fallback shown when the booking wizard can't establish a (guest) session —
 * e.g. Supabase Anonymous Sign-Ins are disabled. Lets the user sign in instead
 * of staring at a blank page.
 */
export function BookingAuthError({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-[#050507] dark:text-[#ede9f8]">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm dark:border-zinc-800 dark:bg-[#0c0b14]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
          <span className="material-symbols-outlined text-3xl text-amber-600">lock</span>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-[#ede9f8]">Sign in to continue</h2>
        <p className="mx-auto mt-3 max-w-sm text-[15px] leading-relaxed text-zinc-500 dark:text-zinc-400">
          {message}
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block w-full rounded-xl bg-[#3e0074] py-4 text-base font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all hover:-translate-y-0.5 active:scale-[0.98] dark:bg-[#5b21b6]"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="mt-3 inline-block w-full py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
