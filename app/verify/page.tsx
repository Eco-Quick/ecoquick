"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export default function VerifyPage() {
  const router = useRouter();
  const user = useCustomerAuth();
  const [status, setStatus] = useState<VerificationStatus>("unverified");
  const [method, setMethod] = useState<"stripe_identity" | "manual_upload" | null>(null);
  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [docType, setDocType] = useState<"passport" | "driving_license">("passport");
  const [dob, setDob] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const skipEnabled = process.env.NEXT_PUBLIC_SKIP_VERIFICATION === "true";

  useEffect(() => {
    if (!user) return;
    checkStatus();
  }, [user?.id]);

  async function checkStatus() {
    try {
      const res = await fetch("/api/verification/status");
      const data = await res.json();
      setStatus(data.status || "unverified");
      if (data.verification?.rejection_reason) {
        setRejectionReason(data.verification.rejection_reason);
      }
    } catch {}
    setLoading(false);
  }

  async function initiateVerification() {
    setInitiating(true);
    setError(null);
    try {
      const res = await fetch("/api/verification/create-session", { method: "POST" });
      const data = await res.json();

      if (data.status === "already_verified") {
        setStatus("verified");
        setInitiating(false);
        return;
      }

      if (data.method === "stripe_identity" && data.clientSecret) {
        // Load Stripe Identity
        const stripeJs = await import("@stripe/stripe-js");
        const stripe = await stripeJs.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
        if (stripe) {
          const result = await stripe.verifyIdentity(data.clientSecret);
          if (result.error) {
            setError(result.error.message || "Verification failed. Try manual upload.");
            setMethod("manual_upload");
          } else {
            // Poll for status update
            setTimeout(() => checkStatus(), 2000);
          }
        }
      } else {
        // Fallback to manual upload
        setMethod("manual_upload");
      }
    } catch {
      setError("Failed to start verification. Please try uploading manually.");
      setMethod("manual_upload");
    }
    setInitiating(false);
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      if (!dob) { setError("Date of birth is required"); setUploading(false); return; }
      const formData = new FormData();
      formData.append("document", file);
      formData.append("documentType", docType);
      formData.append("dateOfBirth", dob);

      const res = await fetch("/api/verification/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");
      setStatus("pending");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
    setUploading(false);
  }

  async function devSkipVerification() {
    const supabase = createClient();
    const { data: { user: u } } = await supabase.auth.getUser();
    if (!u) return;
    await supabase.auth.updateUser({ data: { verification_status: "verified" } });
    setStatus("verified");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050507]">
      <CustomerTopBar />

      <main className="flex justify-center px-4 py-10 md:py-16">
        <div className="w-full max-w-lg">

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-3xl text-[#3e0074] dark:text-[#c084fc]">progress_activity</span>
            </div>
          ) : status === "verified" ? (
            /* ── Verified ── */
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white px-8 py-16 text-center dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                <span className="material-symbols-outlined text-3xl text-emerald-600">verified</span>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#ede9f8]">Identity Verified</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Your identity has been confirmed. You can now book deliveries and accept jobs.
              </p>
              <button
                onClick={() => router.push(user ? "/dashboard" : "/driver")}
                className="rounded-xl bg-[#3e0074] px-8 py-3 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] dark:bg-[#5b21b6]"
              >
                Continue
              </button>
            </div>
          ) : status === "pending" ? (
            /* ── Pending review ── */
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-zinc-200 bg-white px-8 py-16 text-center dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
                <span className="material-symbols-outlined text-3xl text-amber-600">hourglass_top</span>
              </div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-[#ede9f8]">Under Review</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Your ID document has been uploaded and is being reviewed.
                This usually takes less than 24 hours.
              </p>
              <button
                onClick={() => router.back()}
                className="rounded-xl border border-zinc-200 px-8 py-3 text-[13px] font-bold text-zinc-700 transition-all hover:-translate-y-0.5 active:scale-[0.98] dark:border-zinc-700 dark:text-zinc-300"
              >
                Go back
              </button>
            </div>
          ) : (
            /* ── Unverified / Rejected — show verification options ── */
            <>
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-4xl">
                  Verify your identity
                </h1>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  UK law requires age verification (18+) for certain deliveries.
                  Scan your ID to get verified instantly.
                </p>
              </div>

              {status === "rejected" && (
                <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-800/40 dark:bg-red-950/20">
                  <span className="material-symbols-outlined mt-0.5 text-lg text-red-500">error</span>
                  <div>
                    <p className="text-sm font-semibold text-red-700 dark:text-red-400">Verification failed</p>
                    <p className="mt-1 text-[12px] text-red-600/70 dark:text-red-400/70">
                      {rejectionReason || "Your document could not be verified. Please try again with a clear photo."}
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}

              {/* Option 1: Auto verification via Stripe Identity */}
              {method !== "manual_upload" && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-[#0c0b14]">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3e0074]/10 dark:bg-[#c084fc]/10">
                      <span className="material-symbols-outlined text-lg text-[#3e0074] dark:text-[#c084fc]">document_scanner</span>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">Instant Verification</h2>
                      <p className="text-[12px] text-zinc-400">Scan your passport or driving license</p>
                    </div>
                  </div>

                  <ul className="mb-6 space-y-2">
                    {["Takes less than 2 minutes", "Passport or UK driving license", "Photo + selfie verification"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-[13px] text-zinc-500 dark:text-zinc-400">
                        <span className="material-symbols-outlined text-sm text-emerald-500">check</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={initiateVerification}
                    disabled={initiating}
                    className="w-full rounded-xl bg-[#3e0074] py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 dark:bg-[#5b21b6]"
                  >
                    {initiating ? "Starting…" : "Start Verification"}
                  </button>

                  <button
                    onClick={() => setMethod("manual_upload")}
                    className="mt-3 w-full py-2 text-[12px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    Or upload manually instead
                  </button>
                </div>
              )}

              {/* Option 2: Manual upload */}
              {method === "manual_upload" && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-[#0c0b14]">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3e0074]/10 dark:bg-[#c084fc]/10">
                      <span className="material-symbols-outlined text-lg text-[#3e0074] dark:text-[#c084fc]">upload_file</span>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">Upload ID Document</h2>
                      <p className="text-[12px] text-zinc-400">We&apos;ll review it within 24 hours</p>
                    </div>
                  </div>

                  {/* Document type */}
                  <div className="mb-5">
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Document type</label>
                    <div className="flex gap-3">
                      {[
                        { value: "passport" as const, label: "Passport", icon: "badge" },
                        { value: "driving_license" as const, label: "Driving License", icon: "directions_car" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDocType(opt.value)}
                          className={`flex flex-1 items-center gap-2 rounded-xl border px-4 py-3 text-[12px] font-semibold transition-all ${
                            docType === opt.value
                              ? "border-[#3e0074] bg-[#3e0074]/5 text-[#3e0074] dark:border-[#c084fc] dark:bg-[#c084fc]/10 dark:text-[#c084fc]"
                              : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400"
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">{opt.icon}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date of birth */}
                  <div className="mb-5">
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Date of birth (as shown on ID)</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 transition-all duration-200 focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10"
                    />
                  </div>

                  {/* File upload */}
                  <div className="mb-5">
                    <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Upload photo</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50 px-6 py-8 transition-colors hover:border-[#3e0074]/30 hover:bg-[#3e0074]/[0.02] dark:border-zinc-700 dark:bg-[#050507] dark:hover:border-[#c084fc]/30"
                    >
                      {preview ? (
                        <img src={preview} alt="Preview" className="max-h-40 rounded-lg object-contain" />
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-3xl text-zinc-300 dark:text-zinc-600">cloud_upload</span>
                          <p className="text-[13px] font-medium text-zinc-400">Click to upload or take a photo</p>
                          <p className="text-[11px] text-zinc-300 dark:text-zinc-600">JPEG, PNG, or PDF — max 10MB</p>
                        </>
                      )}
                    </button>
                    {file && (
                      <p className="mt-2 text-[12px] text-zinc-500">{file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)</p>
                    )}
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className="w-full rounded-xl bg-[#3e0074] py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 dark:bg-[#5b21b6]"
                  >
                    {uploading ? "Uploading…" : "Submit for Review"}
                  </button>

                  <button
                    onClick={() => setMethod(null)}
                    className="mt-3 w-full py-2 text-[12px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                  >
                    Back to instant verification
                  </button>
                </div>
              )}

              {/* Do it later */}
              {status === "unverified" && (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="mt-6 w-full py-3 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                >
                  Do it later
                </button>
              )}

              {/* Dev skip button */}
              {skipEnabled && (
                <button
                  onClick={devSkipVerification}
                  className="mt-4 w-full rounded-xl border border-dashed border-amber-300 bg-amber-50 py-3 text-[12px] font-bold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                >
                  DEV: Skip Verification
                </button>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
