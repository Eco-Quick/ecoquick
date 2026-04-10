"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("ecoquickRememberEmail");
      if (stored) {
        setEmail(stored);
        setRememberMe(true);
      }
    } catch {}
  }, []);

  const handleSubmit = async (event: { preventDefault(): void }) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Save/clear remembered email BEFORE navigating
    try {
      if (rememberMe) {
        window.localStorage.setItem("ecoquickRememberEmail", email.trim().toLowerCase());
      } else {
        window.localStorage.removeItem("ecoquickRememberEmail");
      }
    } catch {}

    const role = data.user?.user_metadata?.role;
    // Small delay to ensure localStorage write completes before navigation
    await new Promise((r) => setTimeout(r, 50));
    router.push(role === "driver" ? "/driver" : "/dashboard");
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError("Enter your email address first, then click forgot password.");
      return;
    }
    setForgotLoading(true);
    setError(null);
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/account/settings`,
    });
    setForgotLoading(false);
    setForgotSent(true);
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:placeholder:text-zinc-600 dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10";

  const labelClass =
    "mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400";

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050507]">
      <div className="px-6 lg:px-8">
        <LandingHeader />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-md">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-4xl">
              Welcome back
            </h1>
            <p className="mt-2 font-secondary text-sm text-zinc-500 dark:text-zinc-400">
              Sign in to your EcoQuick account
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#0c0b14]">

            {error && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}

            {forgotSent && (
              <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-400">
                <span className="material-symbols-outlined text-base">check_circle</span>
                Reset link sent — check your inbox.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className={labelClass}>Email address</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined text-lg text-zinc-400 dark:text-zinc-500">mail</span>
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`${inputClass} pl-11`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={labelClass}>Password</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                    <span className="material-symbols-outlined text-lg text-zinc-400 dark:text-zinc-500">lock</span>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`${inputClass} pl-11 pr-16`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-zinc-400 transition-colors hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-300 text-[#3e0074] accent-[#3e0074] dark:border-zinc-600 dark:accent-[#c084fc]"
                  />
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                    Remember me
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="text-sm font-semibold text-[#3e0074] transition-colors hover:underline disabled:opacity-50 dark:text-[#c084fc]"
                >
                  {forgotLoading ? "Sending…" : "Forgot password?"}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#3e0074] py-4 text-base font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-[#5b21b6] dark:shadow-[0_4px_16px_rgba(91,33,182,0.3)]"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
            New to EcoQuick?{" "}
            <Link href="/signup" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">
              Create an account
            </Link>
          </p>

          {/* Trust badges */}
          <div className="mt-8 flex items-center justify-center gap-6 text-zinc-300 dark:text-zinc-700">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">lock</span>
              <span className="text-[10px] font-medium">Encrypted</span>
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[10px] font-medium">Secure auth</span>
            </div>
            <div className="h-3 w-px bg-zinc-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">shield</span>
              <span className="text-[10px] font-medium">GDPR</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
