"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { LandingFooter } from "@/components/layout/LandingFooter";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProfileParam = searchParams.get("profile");
  const initialProfile: "customer" | "driver" =
    initialProfileParam === "driver" ? "driver" : "customer";

  const [profile, setProfile] = useState<"customer" | "driver">(initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  const handleSubmit = async (event: { preventDefault(): void; currentTarget: HTMLFormElement }) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const fullName = (formData.get("fullName") as string).trim();
    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("password") as string;
    const phone = (formData.get("phone") as string | null)?.trim() ?? "";
    const dob = (formData.get("dob") as string | null) ?? "";
    const licenseExpiry = (formData.get("licenseExpiry") as string | null) ?? "";

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: profile,
          phone_number: phone,
          ...(profile === "customer" ? { date_of_birth: dob } : { license_expiry: licenseExpiry }),
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // No session means Supabase requires email confirmation
    if (!data.session) {
      setConfirmEmail(email);
      return;
    }

    router.push(profile === "driver" ? "/driver" : "/dashboard");
  };

  return (
    <div className="min-h-screen bg-white text-[#3e0074] dark:bg-[#0d0916] dark:text-[#c084fc]">
      <div className="px-4 md:px-6">
        <LandingHeader />
      </div>

      <main className="flex min-h-screen flex-col items-center px-4 py-12 md:py-24">
        <div className="w-full max-w-3xl" id="signup-form">
          {confirmEmail ? (
            <div className="flex flex-col items-center gap-6 py-16 text-center">
              <span className="text-5xl">✉️</span>
              <h1 className="text-3xl uppercase tracking-tight text-[#3e0074]">Check your email</h1>
              <p className="max-w-sm text-sm font-medium text-[#3e0074]/70">
                We sent a confirmation link to <strong>{confirmEmail}</strong>.
                Click it to activate your account, then{" "}
                <Link href="/login" className="font-bold text-[#3e0074] underline underline-offset-4">
                  sign in here
                </Link>
                .
              </p>
            </div>
          ) : (
          <>
          <h1 className="mb-12 text-center text-5xl uppercase leading-[0.85] tracking-[-0.06em] md:text-[70px]">
            Join EcoQuick
          </h1>

          <div className="space-y-12">
            <section className="space-y-4">
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3e0074]/60">
                01 / Select Profile
              </span>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {(["customer", "driver"] as const).map((type) => (
                  <div
                    key={type}
                    className={`group flex min-w-[120px] flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border px-4 py-3 text-xs md:text-sm transition-all md:px-6 md:py-3.5 ${
                      profile === type
                        ? "border-[#3e0074] bg-[#3e0074] text-white shadow-lg shadow-[#3e0074]/30"
                        : "border-[#3e0074]/30 bg-white text-[#3e0074] hover:border-[#3e0074] hover:bg-[#3e0074]/5"
                    }`}
                    onClick={() => {
                      setProfile(type);
                      router.replace(type === "driver" ? "/signup?profile=driver" : "/signup");
                    }}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-accent transition-colors ${
                        profile === type ? "bg-white/15" : "bg-[#3e0074]/5"
                      }`}
                    >
                      {type === "customer" ? (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="8" r="3.5" />
                          <path d="M5.5 19c1.2-3 3.3-4.5 6.5-4.5S16.8 16 18 19" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="7" width="11" height="8" rx="1" />
                          <path d="M14 9h3.5L21 11.5V15h-3" />
                          <circle cx="8" cy="17" r="1.8" />
                          <circle cx="18" cy="17" r="1.8" />
                        </svg>
                      )}
                    </span>
                    <span className="text-[11px] md:text-xs font-semibold tracking-[0.16em] capitalize">
                      {type}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <form className="space-y-8" onSubmit={handleSubmit}>
              <section className="space-y-6">
                <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3e0074]/60">
                  {profile === "customer" ? "02 / Personal details" : "02 / Driver details"}
                </span>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.22em] text-[#3e0074]/60">
                      Full name
                    </label>
                    <input
                      name="fullName"
                      type="text"
                      placeholder="Johnathan Doe"
                      required
                      className="sharp-corners w-full border border-[#3e0074] bg-white p-4 text-xs font-bold uppercase text-[#3e0074] placeholder:opacity-50 focus:border-[#3e0074] focus:outline-none focus:ring-0 dark:bg-[#161027] dark:border-[#4c1d95] dark:text-[#ede9f8] dark:focus:border-[#c084fc]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.22em] text-[#3e0074]/60">
                        Email address
                      </label>
                      <input
                        name="email"
                        type="email"
                        placeholder="john@ecoquick.com"
                        required
                        className="sharp-corners w-full border border-[#3e0074] bg-white p-4 text-xs font-bold uppercase text-[#3e0074] placeholder:opacity-50 focus:border-[#3e0074] focus:outline-none focus:ring-0 dark:bg-[#161027] dark:border-[#4c1d95] dark:text-[#ede9f8] dark:focus:border-[#c084fc]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.22em] text-[#3e0074]/60">
                        Phone number
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+44 000 000 0000"
                        className="sharp-corners w-full border border-[#3e0074] bg-white p-4 text-xs font-bold uppercase text-[#3e0074] placeholder:opacity-50 focus:border-[#3e0074] focus:outline-none focus:ring-0 dark:bg-[#161027] dark:border-[#4c1d95] dark:text-[#ede9f8] dark:focus:border-[#c084fc]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.22em] text-[#3e0074]/60">
                        Password
                      </label>
                      <input
                        name="password"
                        type="password"
                        placeholder="••••••••••••"
                        required
                        minLength={6}
                        className="sharp-corners w-full border border-[#3e0074] bg-white p-4 text-xs font-bold uppercase text-[#3e0074] placeholder:opacity-50 focus:border-[#3e0074] focus:outline-none focus:ring-0 dark:bg-[#161027] dark:border-[#4c1d95] dark:text-[#ede9f8] dark:focus:border-[#c084fc]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-[9px] font-black uppercase tracking-[0.22em] text-[#3e0074]/60">
                        {profile === "customer" ? "Date of birth" : "License expiry"}
                      </label>
                      <input
                        type="date"
                        name={profile === "customer" ? "dob" : "licenseExpiry"}
                        className="sharp-corners w-full border border-[#3e0074] bg-white p-4 text-xs font-bold uppercase text-[#3e0074] focus:border-[#3e0074] focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="sharp-corners space-y-4 border border-[#3e0074]/20 bg-[#3e0074]/5 p-6 dark:border-[#4c1d95]/40 dark:bg-[#3f0075]/10">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#3e0074] text-xs font-bold">
                    ✓
                  </span>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.22em]">
                    Identity verification
                  </h4>
                </div>
                <ul className="space-y-2 text-[9px] font-bold uppercase leading-relaxed text-[#3e0074]/70">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 bg-accent" />
                    Required for UK age verification laws and secure courier operations.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 bg-accent" />
                    Documents are securely encrypted and stored with bank‑grade protocols.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 flex-shrink-0 bg-accent" />
                    Used exclusively for age and professional verification purposes.
                  </li>
                </ul>
              </section>

              {error && (
                <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-red-700">
                  {error}
                </div>
              )}

              <section className="space-y-4 pt-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" required className="sharp-corners h-4 w-4 border border-[#3e0074] text-[#3e0074] accent-[#3e0074]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#3e0074]/70">
                    I agree to the{" "}
                    <Link href="/terms" className="underline underline-offset-2 hover:text-[#3e0074]">
                      Terms of Service
                    </Link>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" required className="sharp-corners h-4 w-4 border border-[#3e0074] text-[#3e0074] accent-[#3e0074]" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#3e0074]/70">
                    I agree to the{" "}
                    <Link href="/privacy" className="underline underline-offset-2 hover:text-[#3e0074]">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </section>

              <button
                type="submit"
                disabled={loading}
                className="btn-press btn-sweep sharp-corners mt-8 w-full bg-[#3e0074] py-6 text-xs font-bold uppercase tracking-[0.3em] text-white transition hover:bg-[#2f0058] disabled:opacity-60"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="border-t border-[#3e0074]/10 pt-8 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#3e0074]/60">
                Already have an account?
                <Link href="/login" className="ml-2 border-b border-[#3e0074] text-[#3e0074]">
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
          </>
          )}
        </div>
      </main>

      <div className="mx-auto w-full max-w-6xl px-4 md:px-6">
        <LandingFooter />
      </div>
    </div>
  );
}
