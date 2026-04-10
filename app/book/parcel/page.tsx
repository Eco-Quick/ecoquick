"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStepper } from "../../../components/book/BookingStepper";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";

const CATEGORIES = [
  { value: "documents", label: "Documents", icon: "description", ageRestricted: false },
  { value: "electronics", label: "Electronics", icon: "devices", ageRestricted: false },
  { value: "food", label: "Food & Groceries", icon: "restaurant", ageRestricted: false },
  { value: "clothing", label: "Clothing", icon: "checkroom", ageRestricted: false },
  { value: "alcohol", label: "Alcohol", icon: "liquor", ageRestricted: true },
  { value: "tobacco", label: "Tobacco", icon: "smoking_rooms", ageRestricted: true },
  { value: "other", label: "Other", icon: "inventory_2", ageRestricted: false },
];

const SIZES = [
  { value: "envelope", label: "Envelope", desc: "Up to 0.5 kg", icon: "mail" },
  { value: "small", label: "Small", desc: "Up to 2 kg", icon: "package_2" },
  { value: "medium", label: "Medium", desc: "Up to 10 kg", icon: "deployed_code" },
  { value: "large", label: "Large", desc: "Up to 25 kg", icon: "pallet" },
];

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
        const hasRoute = parsed.deliveryType && parsed.pickupAddress && parsed.dropoffAddress;
        if (!hasRoute) { router.replace("/book/route"); return; }
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
    if (form.totalItems.trim() && (!Number.isFinite(items) || items < 1)) next.totalItems = "Must be at least 1";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleContinue() {
    setSubmitError(null);
    if (!validate()) { setSubmitError("Please complete the required fields."); return; }
    try {
      const saved = sessionStorage.getItem("deliveryRequest");
      const data = saved ? JSON.parse(saved) : {};
      sessionStorage.setItem("deliveryRequest", JSON.stringify({
        ...data,
        packageCategory: form.packageCategory,
        packageSize: form.packageSize,
        weight: parseFloat(form.weight) || 0,
        totalItems: parseInt(form.totalItems) || 1,
        handlingInstructions: form.handlingInstructions,
      }));
    } catch {}
    router.push("/book/confirm");
  }

  if (!user || !hydrated) return null;

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:placeholder:text-zinc-600 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-700"
        : "border-zinc-200 focus:border-[#3e0074] focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050507] dark:text-[#ede9f8]">
      <CustomerTopBar />

      <main className="flex flex-1 flex-col items-center px-4 py-6 md:py-10">
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <BookingStepper currentStep={3} />
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-3xl">
            Package details
          </h1>
          <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Tell us about what you&apos;re sending.
          </p>

          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
            <form className="space-y-6 p-6" onSubmit={(e) => e.preventDefault()}>

              {/* Category — selectable pills */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Category *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, packageCategory: cat.value }))}
                      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[12px] font-semibold transition-all ${
                        form.packageCategory === cat.value
                          ? "border-[#3e0074] bg-[#3e0074]/[0.06] text-[#3e0074] dark:border-[#c084fc] dark:bg-[#c084fc]/10 dark:text-[#c084fc]"
                          : "border-zinc-200 text-zinc-500 hover:border-zinc-300 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{cat.icon}</span>
                      {cat.label}
                      {cat.ageRestricted && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">18+</span>
                      )}
                    </button>
                  ))}
                </div>
                {errors.packageCategory && <p className="mt-1 text-[11px] font-medium text-red-500">{errors.packageCategory}</p>}
              </div>

              {/* Size — card selection */}
              <div>
                <label className="mb-2 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Size *
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SIZES.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, packageSize: size.value }))}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border p-4 text-center transition-all ${
                        form.packageSize === size.value
                          ? "border-[#3e0074] bg-[#3e0074]/[0.06] dark:border-[#c084fc] dark:bg-[#c084fc]/10"
                          : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-xl ${
                        form.packageSize === size.value ? "text-[#3e0074] dark:text-[#c084fc]" : "text-zinc-400"
                      }`}>{size.icon}</span>
                      <span className={`text-[12px] font-bold ${
                        form.packageSize === size.value ? "text-[#3e0074] dark:text-[#c084fc]" : "text-zinc-700 dark:text-zinc-300"
                      }`}>{size.label}</span>
                      <span className="text-[10px] text-zinc-400">{size.desc}</span>
                    </button>
                  ))}
                </div>
                {errors.packageSize && <p className="mt-1 text-[11px] font-medium text-red-500">{errors.packageSize}</p>}
              </div>

              {/* Weight + Items */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Weight (kg) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      className={inputClass(!!errors.weight)}
                      value={form.weight}
                      onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-zinc-400">kg</span>
                  </div>
                  {errors.weight && <p className="mt-1 text-[11px] font-medium text-red-500">{errors.weight}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                    Total items
                  </label>
                  <input
                    type="number"
                    placeholder="1"
                    className={inputClass(!!errors.totalItems)}
                    value={form.totalItems}
                    onChange={(e) => setForm((f) => ({ ...f, totalItems: e.target.value }))}
                  />
                  {errors.totalItems && <p className="mt-1 text-[11px] font-medium text-red-500">{errors.totalItems}</p>}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                  Handling instructions
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:border-[#3e0074] focus:outline-none focus:ring-2 focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:placeholder:text-zinc-600 dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10"
                  placeholder="E.g. fragile, gate codes, specific instructions..."
                  value={form.handlingInstructions}
                  onChange={(e) => setForm((f) => ({ ...f, handlingInstructions: e.target.value }))}
                />
              </div>
            </form>
          </div>

          {submitError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400">
              <span className="material-symbols-outlined text-base">error</span>
              {submitError}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Link
              href="/book/route"
              className="flex items-center gap-2 text-[13px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </Link>
            <button
              onClick={handleContinue}
              className="rounded-xl bg-[#3e0074] px-10 py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] dark:bg-[#5b21b6]"
            >
              Review Order
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
