"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { LandingHeader } from "@/components/layout/LandingHeader";
import { createClient } from "@/lib/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s\-()]{7,20}$/;

type FieldErrors = Partial<
  Record<
    | "fullName"
    | "email"
    | "phone"
    | "password"
    | "confirmPassword"
    | "licenseExpiry"
    | "form",
    string
  >
>;

function passwordStrength(pw: string): { score: 0 | 1 | 2 | 3; label: string } {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const clamped = Math.min(3, score) as 0 | 1 | 2 | 3;
  return {
    score: clamped,
    label: ["Too short", "Weak", "Fair", "Strong"][clamped],
  };
}

function mapAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("user already")) {
    return "An account with this email already exists. Please sign in instead.";
  }
  if (m.includes("password")) {
    return "Password doesn't meet the requirements (minimum 8 characters with letters and numbers).";
  }
  if (m.includes("rate") || m.includes("too many")) {
    return "Too many attempts — please wait a minute before trying again.";
  }
  if (m.includes("invalid email")) {
    return "That email address doesn't look right. Please double-check it.";
  }
  return message;
}

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);

  // Controlled inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  function validate(): FieldErrors {
    const e: FieldErrors = {};

    // Name
    const trimmedName = fullName.trim();
    if (trimmedName.length < 2) {
      e.fullName = "Please enter your full name (at least 2 characters).";
    } else if (!/\s/.test(trimmedName)) {
      e.fullName = "Please enter your first and last name.";
    } else if (/\d/.test(trimmedName)) {
      e.fullName = "Names shouldn't contain numbers.";
    }

    // Email
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      e.email = "Email is required.";
    } else if (!EMAIL_RE.test(trimmedEmail)) {
      e.email = "Enter a valid email address.";
    }

    // Phone — required for drivers, optional for customers
    const trimmedPhone = phone.trim();
    if (profile === "driver" && !trimmedPhone) {
      e.phone = "Phone number is required for drivers (we use it to contact you about jobs).";
    } else if (trimmedPhone && !PHONE_RE.test(trimmedPhone)) {
      e.phone = "Enter a valid phone number (digits, spaces, +, - or () only).";
    }

    // Password
    if (password.length < 8) {
      e.password = "Password must be at least 8 characters.";
    } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      e.password = "Password must include both letters and numbers.";
    }

    // Confirm password
    if (confirmPassword !== password) {
      e.confirmPassword = "Passwords don't match.";
    }

    // License expiry — drivers only
    if (profile === "driver") {
      if (!licenseExpiry) {
        e.licenseExpiry = "License expiry date is required.";
      } else {
        const d = new Date(licenseExpiry);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (Number.isNaN(d.getTime())) {
          e.licenseExpiry = "Enter a valid date.";
        } else if (d <= today) {
          e.licenseExpiry = "Your license is expired or expires today. Please renew before signing up.";
        }
      }
    }

    // Consent
    if (!agreeTerms || !agreePrivacy) {
      e.form = "Please accept the Terms of Service and Privacy Policy to continue.";
    }

    return e;
  }

  const handleSubmit = async (event: { preventDefault(): void }) => {
    event.preventDefault();
    setErrors({});

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          role: profile,
          phone_number: cleanPhone,
          verification_status: "unverified",
          ...(profile === "driver" ? { license_expiry: licenseExpiry } : {}),
        },
      },
    });

    if (error) {
      setLoading(false);
      setErrors({ form: mapAuthError(error.message) });
      return;
    }

    // Supabase returns a fake user with empty `identities` array when the email
    // is already registered (anti-enumeration). Detect and message clearly.
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      setLoading(false);
      setErrors({
        email:
          "An account with this email already exists. Please sign in instead, or use Forgot password if you've lost access.",
      });
      return;
    }

    // Create driver_profiles row for driver signups
    if (profile === "driver" && data.user) {
      const { error: profileError } = await supabase.from("driver_profiles").upsert({
        id: data.user.id,
        full_name: cleanName,
        phone: cleanPhone,
      });
      if (profileError) {
        // Auth account was created but driver profile failed — surface clearly.
        setLoading(false);
        setErrors({
          form:
            "Your account was created but we couldn't set up your driver profile. Please contact support.",
        });
        return;
      }
    }

    setLoading(false);

    // No session means Supabase requires email confirmation
    if (!data.session) {
      setConfirmEmail(cleanEmail);
      return;
    }

    router.push(profile === "driver" ? "/driver" : "/dashboard");
  };

  const inputClass =
    "w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-base text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:placeholder:text-zinc-600 dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10";

  const errorInputClass = "border-red-300 focus:border-red-500 focus:ring-red-100 dark:border-red-700/60";

  const labelClass =
    "mb-1.5 block text-[13px] font-semibold text-zinc-500 dark:text-zinc-400";

  const fieldError = (key: keyof FieldErrors) =>
    errors[key] ? (
      <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-red-600 dark:text-red-400">
        <span className="material-symbols-outlined text-sm">error</span>
        {errors[key]}
      </p>
    ) : null;

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
                          setErrors({});
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
                <form className="space-y-5" onSubmit={handleSubmit} noValidate>
                  <div>
                    <label className={labelClass}>Full name</label>
                    <input
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`${inputClass} ${errors.fullName ? errorInputClass : ""}`}
                    />
                    {fieldError("fullName")}
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Email address</label>
                      <input
                        name="email"
                        type="email"
                        placeholder="john@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className={`${inputClass} ${errors.email ? errorInputClass : ""}`}
                      />
                      {fieldError("email")}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Phone number {profile === "driver" && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        placeholder="+44 7000 000000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        className={`${inputClass} ${errors.phone ? errorInputClass : ""}`}
                      />
                      {fieldError("phone")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Password</label>
                      <input
                        name="password"
                        type="password"
                        placeholder="Min. 8 chars, letters + numbers"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className={`${inputClass} ${errors.password ? errorInputClass : ""}`}
                      />
                      {password && (
                        <div className="mt-2">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className={`h-1 flex-1 rounded-full ${
                                  i < strength.score
                                    ? strength.score === 1
                                      ? "bg-red-400"
                                      : strength.score === 2
                                      ? "bg-amber-400"
                                      : "bg-emerald-500"
                                    : "bg-zinc-200 dark:bg-zinc-700"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                            {strength.label}
                          </p>
                        </div>
                      )}
                      {fieldError("password")}
                    </div>
                    <div>
                      <label className={labelClass}>Confirm password</label>
                      <input
                        name="confirmPassword"
                        type="password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        className={`${inputClass} ${errors.confirmPassword ? errorInputClass : ""}`}
                      />
                      {fieldError("confirmPassword")}
                    </div>
                  </div>

                  {profile === "driver" && (
                    <div>
                      <label className={labelClass}>
                        License expiry <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="licenseExpiry"
                        value={licenseExpiry}
                        onChange={(e) => setLicenseExpiry(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className={`${inputClass} ${errors.licenseExpiry ? errorInputClass : ""}`}
                      />
                      {fieldError("licenseExpiry")}
                      {!errors.licenseExpiry && (
                        <p className="mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                          Your license must be valid for the duration of your work with us.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Verification note */}
                  <div className="flex gap-3 rounded-xl bg-zinc-50 p-4 dark:bg-[#050507]">
                    <span className="material-symbols-outlined mt-0.5 text-lg text-[#3e0074] dark:text-[#c084fc]">verified_user</span>
                    <p className="text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                      Your data is encrypted and only used for identity verification.
                      We comply with UK data protection laws.
                    </p>
                  </div>

                  {errors.form && (
                    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
                      <span className="material-symbols-outlined text-base">error</span>
                      {errors.form}
                    </div>
                  )}

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-1">
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#3e0074] accent-[#3e0074] dark:border-zinc-600 dark:accent-[#c084fc]"
                      />
                      <span className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                        I agree to the{" "}
                        <Link href="/terms" className="font-semibold text-[#3e0074] hover:underline dark:text-[#c084fc]">Terms of Service</Link>
                      </span>
                    </label>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="checkbox"
                        checked={agreePrivacy}
                        onChange={(e) => setAgreePrivacy(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-[#3e0074] accent-[#3e0074] dark:border-zinc-600 dark:accent-[#c084fc]"
                      />
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
