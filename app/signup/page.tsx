"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupFallback />}>
      <SignupPageContent />
    </Suspense>
  );
}

function SignupFallback() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#050507]">
      <div className="px-6 lg:px-8">
        <LandingHeader />
      </div>
      <main className="flex min-h-[60vh] items-center justify-center">
        <span className="material-symbols-outlined animate-spin text-3xl text-[#3e0074] dark:text-[#c084fc]">progress_activity</span>
      </main>
    </div>
  );
}

function SignupPageContent() {
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
          verification_status: "unverified",
          ...(profile === "customer" ? { date_of_birth: dob } : { license_expiry: licenseExpiry }),
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Create driver_profiles row for driver signups
    if (profile === "driver" && data.user) {
      await supabase.from("driver_profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        phone: phone,
      });
    }

    // No session means Supabase requires email confirmation
    if (!data.session) {
      setConfirmEmail(email);
      return;
    }

    router.push(profile === "driver" ? "/driver" : "/verify");
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

      <main className="flex justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-lg">

          {confirmEmail ? (
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white px-8 py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                <span className="material-symbols-outlined text-3xl text-emerald-600">mark_email_read</span>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#ede9f8]">Check your email</h1>
              <p className="max-w-sm font-secondary text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                We sent a confirmation link to <strong className="text-zinc-900 dark:text-[#ede9f8]">{confirmEmail}</strong>.
                Click it to activate your account, then{" "}
                <Link href="/login" className="font-semibold text-[#3e0074] underline underline-offset-4 dark:text-[#c084fc]">
                  sign in here
                </Link>.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-4xl">
                  Create your account
                </h1>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  Join EcoQuick as a {profile === "customer" ? "customer" : "driver"} and start today.
                </p>
              </div>

              {/* Card */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-[#0c0b14]">

                {/* Profile toggle */}
                <div className="mb-8">
                  <div className="flex rounded-xl bg-zinc-100 p-1 dark:bg-[#050507]">
                    {(["customer", "driver"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all duration-200 ${
                          profile === type
                            ? "bg-white text-[#3e0074] shadow-sm dark:bg-[#241c3d] dark:text-[#c084fc]"
                            : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                        }`}
                        onClick={() => {
                          setProfile(type);
                          router.replace(type === "driver" ? "/signup?profile=driver" : "/signup");
                        }}
                      >
                        <span className="material-symbols-outlined text-base">
                          {type === "customer" ? "person" : "local_shipping"}
                        </span>
                        <span className="capitalize">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className={labelClass}>Full name</label>
                    <input name="fullName" type="text" placeholder="John Doe" required className={inputClass} />
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Email address</label>
                      <input name="email" type="email" placeholder="john@email.com" required className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Phone number</label>
                      <input name="phone" type="tel" placeholder="+44 7000 000000" className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Password</label>
                      <input name="password" type="password" placeholder="Min. 6 characters" required minLength={6} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>
                        {profile === "customer" ? "Date of birth" : "License expiry"}
                      </label>
                      <input
                        type="date"
                        name={profile === "customer" ? "dob" : "licenseExpiry"}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Verification note */}
                  <div className="flex gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-[#050507]">
                    <span className="material-symbols-outlined mt-0.5 text-lg text-[#3e0074] dark:text-[#c084fc]">verified_user</span>
                    <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Your data is encrypted and only used for identity verification.
                      We comply with UK data protection laws.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
                      <span className="material-symbols-outlined text-base">error</span>
                      {error}
                    </div>
                  )}

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-1">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#3e0074] accent-[#3e0074] dark:border-zinc-600 dark:accent-[#c084fc]" />
                      <span className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        I agree to the{" "}
                        <Link href="/terms" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">Terms of Service</Link>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input type="checkbox" required className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#3e0074] accent-[#3e0074] dark:border-zinc-600 dark:accent-[#c084fc]" />
                      <span className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        I agree to the{" "}
                        <Link href="/privacy" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">Privacy Policy</Link>
                      </span>
                    </label>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full rounded-xl bg-[#3e0074] py-4 text-base font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 dark:bg-[#5b21b6] dark:shadow-[0_4px_16px_rgba(91,33,182,0.3)]"
                  >
                    {loading ? "Creating account…" : "Create account"}
                  </button>
                </form>
              </div>

              {/* Footer link */}
              <p className="mt-6 text-center text-sm text-zinc-400 dark:text-zinc-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
