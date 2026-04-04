"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStepper } from "../../../components/book/BookingStepper";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

export default function BookParcelPage() {
  const user = useCustomerAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    packageCategory: "",
    packageSize: "",
    weight: "",
    totalItems: "1",
    handlingInstructions: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("deliveryRequest");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Step gating: parcel requires route info to exist
        const hasRoute =
          parsed.deliveryType &&
          parsed.pickupAddress &&
          parsed.pickupPostcode &&
          parsed.pickupCity &&
          parsed.senderName &&
          parsed.senderPhone &&
          parsed.dropoffAddress &&
          parsed.dropoffPostcode &&
          parsed.dropoffCity &&
          parsed.recipientName &&
          parsed.recipientPhone;
        if (!hasRoute) {
          router.replace("/book/route");
          return;
        }
        setForm((f) => ({
          packageCategory: parsed.packageCategory ?? f.packageCategory,
          packageSize: parsed.packageSize ?? f.packageSize,
          weight: parsed.weight != null ? String(parsed.weight) : f.weight,
          totalItems: parsed.totalItems != null ? String(parsed.totalItems) : f.totalItems,
          handlingInstructions: parsed.handlingInstructions ?? f.handlingInstructions,
        }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  function validate() {
    const next: Partial<Record<keyof typeof form, string>> = {};
    if (!form.packageCategory.trim()) next.packageCategory = "Required";
    if (!form.packageSize.trim()) next.packageSize = "Required";

    const w = parseFloat(form.weight);
    if (!form.weight.trim()) next.weight = "Required";
    else if (!Number.isFinite(w) || w <= 0) next.weight = "Enter a valid weight";

    const items = parseInt(form.totalItems, 10);
    if (form.totalItems.trim() && (!Number.isFinite(items) || items < 1)) {
      next.totalItems = "Must be at least 1";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleContinue() {
    setSubmitError(null);
    if (!validate()) {
      setSubmitError("Please complete the required fields to continue.");
      return;
    }
    try {
      const saved = sessionStorage.getItem("deliveryRequest");
      const data = saved ? JSON.parse(saved) : {};
      sessionStorage.setItem(
        "deliveryRequest",
        JSON.stringify({
          ...data,
          packageCategory: form.packageCategory,
          packageSize: form.packageSize,
          weight: parseFloat(form.weight) || 0,
          totalItems: parseInt(form.totalItems) || 1,
          handlingInstructions: form.handlingInstructions,
        })
      );
    } catch {}
    router.push("/book/confirm");
  }

  if (!user || !hydrated) return null;
  return (
    <div className="page-fade flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <CustomerTopBar />

      <main className="flex flex-1 flex-col items-center py-8 px-4 md:px-6">
        <div className="w-full max-w-5xl bg-white shadow-[0_20px_50px_-12px_rgba(62,0,116,0.15)]">
          {/* Stepper */}
          <div className="border-b border-slate-100 bg-white px-6 pb-12 pt-10 md:px-8">
            <BookingStepper currentStep={3} />
            <div className="mt-10 text-center">
              <h1 className="text-3xl font-black uppercase tracking-tight text-primary sm:text-4xl">
                Package details
              </h1>
              <div className="mx-auto mt-4 h-1 w-12 bg-primary" aria-hidden />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-10 md:px-10 md:py-12">
            <div className="border border-primary bg-white p-10 shadow-[0_20px_50px_-12px_rgba(62,0,116,0.15)]">
              <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-primary">
                      Package category *
                    </label>
                    <select
                      className={[
                        "h-14 w-full border bg-white px-4 text-sm font-bold uppercase tracking-wide text-primary",
                        errors.packageCategory ? "border-accent" : "border-primary",
                      ].join(" ")}
                      value={form.packageCategory}
                      onChange={(e) => setForm((f) => ({ ...f, packageCategory: e.target.value }))}
                    >
                      <option value="">Select category</option>
                      <option value="documents">Documents</option>
                      <option value="electronics">Electronics</option>
                      <option value="food">Food &amp; groceries</option>
                      <option value="clothing">Clothing &amp; apparel</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.packageCategory && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                        {errors.packageCategory}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-primary">
                      Package size *
                    </label>
                    <select
                      className={[
                        "h-14 w-full border bg-white px-4 text-sm font-bold uppercase tracking-wide text-primary",
                        errors.packageSize ? "border-accent" : "border-primary",
                      ].join(" ")}
                      value={form.packageSize}
                      onChange={(e) => setForm((f) => ({ ...f, packageSize: e.target.value }))}
                    >
                      <option value="">Select size</option>
                      <option value="envelope">Envelope (up to 0.5kg)</option>
                      <option value="small">Small (up to 2kg)</option>
                      <option value="medium">Medium (up to 10kg)</option>
                      <option value="large">Large (up to 25kg)</option>
                    </select>
                    {errors.packageSize && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                        {errors.packageSize}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-primary">
                      Approximate weight *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        className={[
                          "h-14 w-full border bg-white px-4 text-sm font-bold tracking-wide text-primary",
                          errors.weight ? "border-accent" : "border-primary",
                        ].join(" ")}
                        value={form.weight}
                        onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase tracking-[0.2em] text-primary">
                        kg
                      </span>
                    </div>
                    {errors.weight && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                        {errors.weight}
                      </p>
                    )}
                  </div>
                  <div className="space-y-4">
                    <label className="block text-xs font-black uppercase tracking-[0.2em] text-primary">
                      Total items
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      className={[
                        "h-14 w-full border bg-white px-4 text-sm font-bold tracking-wide text-primary",
                        errors.totalItems ? "border-accent" : "border-primary",
                      ].join(" ")}
                      value={form.totalItems}
                      onChange={(e) => setForm((f) => ({ ...f, totalItems: e.target.value }))}
                    />
                    {errors.totalItems && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                        {errors.totalItems}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] text-primary">
                    Handling instructions &amp; notes
                  </label>
                  <textarea
                    rows={4}
                    className="w-full border border-primary bg-white p-5 text-sm font-medium tracking-wide text-primary/80"
                    placeholder="E.g. fragile items, gate codes, specific recipient instructions..."
                    value={form.handlingInstructions}
                    onChange={(e) => setForm((f) => ({ ...f, handlingInstructions: e.target.value }))}
                  />
                </div>
              </form>
            </div>

            {submitError && (
              <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                {submitError}
              </p>
            )}
            <div className="mx-auto mt-4 flex max-w-4xl items-center justify-between border-t border-slate-100 pt-6">
              <Link
                href="/book/route"
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back
              </Link>
              <button
                onClick={handleContinue}
                className="btn-press btn-sweep flex items-center gap-3 bg-primary px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-black"
              >
                Review order
                <span className="material-symbols-outlined text-base text-accent">east</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
