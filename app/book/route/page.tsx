"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookingStepper } from "../../../components/book/BookingStepper";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import AddressAutocomplete from "@/components/AddressAutocomplete";

export default function BookRoutePage() {
  const user = useCustomerAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    pickupAddress: "",
    pickupPostcode: "",
    pickupCity: "",
    pickupLat: null as number | null,
    pickupLng: null as number | null,
    senderName: "",
    senderPhone: "",
    dropoffAddress: "",
    dropoffPostcode: "",
    dropoffCity: "",
    dropoffLat: null as number | null,
    dropoffLng: null as number | null,
    recipientName: "",
    recipientPhone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("deliveryRequest");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Step gating: route requires deliveryType selected
        if (!parsed.deliveryType) {
          router.replace("/book/type");
          return;
        }
        setForm((f) => ({
          pickupAddress: parsed.pickupAddress ?? f.pickupAddress,
          pickupPostcode: parsed.pickupPostcode ?? f.pickupPostcode,
          pickupCity: parsed.pickupCity ?? f.pickupCity,
          pickupLat: parsed.pickupLat ?? f.pickupLat,
          pickupLng: parsed.pickupLng ?? f.pickupLng,
          senderName: parsed.senderName ?? f.senderName,
          senderPhone: parsed.senderPhone ?? f.senderPhone,
          dropoffAddress: parsed.dropoffAddress ?? f.dropoffAddress,
          dropoffPostcode: parsed.dropoffPostcode ?? f.dropoffPostcode,
          dropoffCity: parsed.dropoffCity ?? f.dropoffCity,
          dropoffLat: parsed.dropoffLat ?? f.dropoffLat,
          dropoffLng: parsed.dropoffLng ?? f.dropoffLng,
          recipientName: parsed.recipientName ?? f.recipientName,
          recipientPhone: parsed.recipientPhone ?? f.recipientPhone,
        }));
      }
    } catch {}
    setHydrated(true);
  }, []);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [field]: value }));

      // live-clear or revalidate this field
      setErrors((prev) => {
        const next = { ...prev };
        const v = value.trim();
        const phoneOk = (val: string) => /^\+?[\d][\d\s\-().]{5,14}$/.test(val.trim());
        const postcodeOk = (val: string) =>
          /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(val.trim());

        if (!v) {
          // empty: only mark required if this field is required
          if (
            [
              "pickupAddress",
              "pickupPostcode",
              "pickupCity",
              "senderName",
              "senderPhone",
              "dropoffAddress",
              "dropoffPostcode",
              "dropoffCity",
              "recipientName",
              "recipientPhone",
            ].includes(field)
          ) {
            next[field] = "Required";
          } else {
            delete next[field];
          }
        } else if (field === "senderPhone" || field === "recipientPhone") {
          if (!phoneOk(v)) next[field] = "Invalid phone";
          else delete next[field];
        } else if (field === "pickupPostcode" || field === "dropoffPostcode") {
          if (!postcodeOk(v)) next[field] = "Invalid postcode";
          else delete next[field];
        } else {
          delete next[field];
        }

        return next;
      });
      setSubmitError(null);
    };
  }

  function validate() {
    const next: Partial<Record<keyof typeof form, string>> = {};
    const required: (keyof typeof form)[] = [
      "pickupAddress",
      "pickupPostcode",
      "pickupCity",
      "senderName",
      "senderPhone",
      "dropoffAddress",
      "dropoffPostcode",
      "dropoffCity",
      "recipientName",
      "recipientPhone",
    ];

    for (const k of required) {
      const v = String(form[k] ?? "").trim();
      if (!v) next[k] = "Required";
    }

    const phoneOk = (v: string) => /^\+?[\d][\d\s\-().]{5,14}$/.test(v.trim());
    if (form.senderPhone.trim() && !phoneOk(form.senderPhone)) next.senderPhone = "Invalid phone";
    if (form.recipientPhone.trim() && !phoneOk(form.recipientPhone)) next.recipientPhone = "Invalid phone";

    const postcodeOk = (v: string) => /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(v.trim());
    if (form.pickupPostcode.trim() && !postcodeOk(form.pickupPostcode)) next.pickupPostcode = "Invalid postcode";
    if (form.dropoffPostcode.trim() && !postcodeOk(form.dropoffPostcode)) next.dropoffPostcode = "Invalid postcode";

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
      sessionStorage.setItem("deliveryRequest", JSON.stringify({ ...data, ...form }));
    } catch {}
    router.push("/book/parcel");
  }

  if (!user || !hydrated) return null;

  const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all duration-200 focus:outline-none focus:ring-2 dark:bg-[#0c0b14] dark:text-[#ede9f8] dark:placeholder:text-zinc-600 ${
      hasError
        ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-700 dark:focus:ring-red-900/20"
        : "border-zinc-200 focus:border-[#3e0074] focus:ring-[#3e0074]/10 dark:border-zinc-700 dark:focus:border-[#c084fc] dark:focus:ring-[#c084fc]/10"
    }`;

  const labelClass = "mb-1.5 block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400";
  const errorClass = "mt-1 text-[11px] font-medium text-red-500";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-[#050507] dark:text-[#ede9f8]">
      <CustomerTopBar />

      <main className="flex flex-1 flex-col items-center px-4 py-6 md:py-10">
        <div className="w-full max-w-5xl">
          <div className="mx-auto mb-8 max-w-2xl">
            <BookingStepper currentStep={2} />
          </div>

          <h1 className="mb-2 text-center text-2xl font-bold text-zinc-900 dark:text-[#ede9f8] md:text-3xl">
            Pickup & Delivery
          </h1>
          <p className="mb-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Enter the addresses and contact details for both ends.
          </p>

          <form className="grid gap-6 lg:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            {/* Pickup section */}
            <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex items-center gap-3 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                  <span className="material-symbols-outlined text-base text-emerald-600">location_on</span>
                </div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">Pickup details</h2>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label className={labelClass}>Address</label>
                  <AddressAutocomplete
                    value={form.pickupAddress}
                    onChange={(val) => setForm((f) => ({ ...f, pickupAddress: val }))}
                    onSelect={(p) =>
                      setForm((f) => ({
                        ...f,
                        pickupAddress: p.description,
                        pickupPostcode: p.postcode || f.pickupPostcode,
                        pickupCity: p.city || f.pickupCity,
                        pickupLat: p.geometry?.location.lat ?? f.pickupLat,
                        pickupLng: p.geometry?.location.lng ?? f.pickupLng,
                      }))
                    }
                    placeholder="Start typing address or postcode"
                    className={inputClass(!!errors.pickupAddress)}
                  />
                  {errors.pickupAddress && <p className={errorClass}>{errors.pickupAddress}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Postcode</label>
                    <input className={inputClass(!!errors.pickupPostcode)} placeholder="E.g. KT1 1QT" value={form.pickupPostcode} onChange={set("pickupPostcode")} />
                    {errors.pickupPostcode && <p className={errorClass}>{errors.pickupPostcode}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input className={inputClass(!!errors.pickupCity)} placeholder="E.g. London" value={form.pickupCity} onChange={set("pickupCity")} />
                    {errors.pickupCity && <p className={errorClass}>{errors.pickupCity}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Sender name</label>
                    <input className={inputClass(!!errors.senderName)} placeholder="Full name" value={form.senderName} onChange={set("senderName")} />
                    {errors.senderName && <p className={errorClass}>{errors.senderName}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Sender phone</label>
                    <input className={inputClass(!!errors.senderPhone)} placeholder="+44 7000 000000" type="tel" value={form.senderPhone} onChange={set("senderPhone")} />
                    {errors.senderPhone && <p className={errorClass}>{errors.senderPhone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery section */}
            <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#0c0b14]">
              <div className="flex items-center gap-3 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <span className="material-symbols-outlined text-base text-blue-600">flag</span>
                </div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-[#ede9f8]">Delivery details</h2>
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <label className={labelClass}>Address</label>
                  <AddressAutocomplete
                    value={form.dropoffAddress}
                    onChange={(val) => setForm((f) => ({ ...f, dropoffAddress: val }))}
                    onSelect={(p) =>
                      setForm((f) => ({
                        ...f,
                        dropoffAddress: p.description,
                        dropoffPostcode: p.postcode || f.dropoffPostcode,
                        dropoffCity: p.city || f.dropoffCity,
                        dropoffLat: p.geometry?.location.lat ?? f.dropoffLat,
                        dropoffLng: p.geometry?.location.lng ?? f.dropoffLng,
                      }))
                    }
                    placeholder="Start typing address or postcode"
                    className={inputClass(!!errors.dropoffAddress)}
                  />
                  {errors.dropoffAddress && <p className={errorClass}>{errors.dropoffAddress}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Postcode</label>
                    <input className={inputClass(!!errors.dropoffPostcode)} placeholder="E.g. TW10 6RW" value={form.dropoffPostcode} onChange={set("dropoffPostcode")} />
                    {errors.dropoffPostcode && <p className={errorClass}>{errors.dropoffPostcode}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>City</label>
                    <input className={inputClass(!!errors.dropoffCity)} placeholder="E.g. Richmond" value={form.dropoffCity} onChange={set("dropoffCity")} />
                    {errors.dropoffCity && <p className={errorClass}>{errors.dropoffCity}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Recipient name</label>
                    <input className={inputClass(!!errors.recipientName)} placeholder="Full name" value={form.recipientName} onChange={set("recipientName")} />
                    {errors.recipientName && <p className={errorClass}>{errors.recipientName}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Recipient phone</label>
                    <input className={inputClass(!!errors.recipientPhone)} placeholder="+44 7000 000000" type="tel" value={form.recipientPhone} onChange={set("recipientPhone")} />
                    {errors.recipientPhone && <p className={errorClass}>{errors.recipientPhone}</p>}
                  </div>
                </div>
              </div>
            </div>
          </form>

          {submitError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-400 ">
              <span className="material-symbols-outlined text-base">error</span>
              {submitError}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between ">
            <Link
              href="/book/type"
              className="flex items-center gap-2 text-[13px] font-semibold text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
            >
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back
            </Link>
            <button
              onClick={handleContinue}
              className="rounded-xl bg-[#3e0074] px-10 py-4 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(63,0,117,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(63,0,117,0.4)] active:scale-[0.98] dark:bg-[#5b21b6]"
            >
              Continue
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
