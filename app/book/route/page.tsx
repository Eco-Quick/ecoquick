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
    senderName: "",
    senderPhone: "",
    dropoffAddress: "",
    dropoffPostcode: "",
    dropoffCity: "",
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
          senderName: parsed.senderName ?? f.senderName,
          senderPhone: parsed.senderPhone ?? f.senderPhone,
          dropoffAddress: parsed.dropoffAddress ?? f.dropoffAddress,
          dropoffPostcode: parsed.dropoffPostcode ?? f.dropoffPostcode,
          dropoffCity: parsed.dropoffCity ?? f.dropoffCity,
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
  return (
    <div className="page-fade flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <CustomerTopBar />

      <main className="flex flex-1 flex-col items-center py-8 px-4 md:px-6">
        <div className="w-full max-w-5xl bg-white shadow-[0_20px_50px_-12px_rgba(62,0,116,0.15)]">
          {/* Stepper */}
          <div className="border-b border-slate-100 bg-white px-6 pb-12 pt-10 md:px-8">
            <BookingStepper currentStep={2} />
            <div className="mt-10 text-center">
              <h1 className="text-3xl font-black uppercase tracking-tight text-primary sm:text-4xl">
                Pickup &amp; Delivery Details
              </h1>
              <div className="mx-auto mt-4 h-1 w-12 bg-primary" aria-hidden />
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-10 md:px-10 md:py-12">
            <div className="mb-10 border border-primary bg-white p-8 md:p-10">
              <form className="space-y-14" onSubmit={(e) => e.preventDefault()}>

                {/* ── Pickup ── */}
                <section>
                  <div className="mb-8 flex items-center gap-3 border-b border-primary/10 pb-4">
                    <span className="material-symbols-outlined text-xl text-accent">location_on</span>
                    <h2 className="text-xl font-black uppercase tracking-tight">Pickup address</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-12">
                    <div className="space-y-2 md:col-span-8">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        Address line 1
                      </label>
                      <AddressAutocomplete
                        value={form.pickupAddress}
                        onChange={(val) => setForm((f) => ({ ...f, pickupAddress: val }))}
                        onSelect={(p) =>
                          setForm((f) => ({
                            ...f,
                            pickupAddress: p.description,
                            pickupPostcode: p.postcode || f.pickupPostcode,
                            pickupCity: p.city || f.pickupCity,
                          }))
                        }
                        placeholder="E.g. 123 Kingston Road"
                      />
                      {errors.pickupAddress && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.pickupAddress}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        Postcode
                      </label>
                      <input
                        className={[
                          "w-full border bg-transparent px-4 py-3 text-sm uppercase tracking-wide focus:outline-none",
                          errors.pickupPostcode ? "border-accent" : "border-primary",
                        ].join(" ")}
                        placeholder="E.g. KT1 1QT"
                        type="text"
                        value={form.pickupPostcode}
                        onChange={set("pickupPostcode")}
                      />
                      {errors.pickupPostcode && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.pickupPostcode}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        City
                      </label>
                      <input
                        className={[
                          "w-full border bg-transparent px-4 py-3 text-sm uppercase tracking-wide focus:outline-none",
                          errors.pickupCity ? "border-accent" : "border-primary",
                        ].join(" ")}
                        placeholder="E.g. London"
                        type="text"
                        value={form.pickupCity}
                        onChange={set("pickupCity")}
                      />
                      {errors.pickupCity && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.pickupCity}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        Sender name
                      </label>
                      <input
                        className={[
                          "w-full border bg-transparent px-4 py-3 text-sm uppercase tracking-wide focus:outline-none",
                          errors.senderName ? "border-accent" : "border-primary",
                        ].join(" ")}
                        placeholder="Full name"
                        type="text"
                        value={form.senderName}
                        onChange={set("senderName")}
                      />
                      {errors.senderName && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.senderName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        Sender phone
                      </label>
                      <input
                        className={[
                          "w-full border bg-transparent px-4 py-3 text-sm uppercase tracking-wide focus:outline-none",
                          errors.senderPhone ? "border-accent" : "border-primary",
                        ].join(" ")}
                        placeholder="+44 7000 000000"
                        type="tel"
                        value={form.senderPhone}
                        onChange={set("senderPhone")}
                      />
                      {errors.senderPhone && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.senderPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* ── Delivery ── */}
                <section>
                  <div className="mb-8 flex items-center gap-3 border-b border-primary/10 pb-4">
                    <span className="material-symbols-outlined text-xl text-accent">local_shipping</span>
                    <h2 className="text-xl font-black uppercase tracking-tight">Delivery address</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-12">
                    <div className="space-y-2 md:col-span-8">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        Address line 1
                      </label>
                      <AddressAutocomplete
                        value={form.dropoffAddress}
                        onChange={(val) => setForm((f) => ({ ...f, dropoffAddress: val }))}
                        onSelect={(p) =>
                          setForm((f) => ({
                            ...f,
                            dropoffAddress: p.description,
                            dropoffPostcode: p.postcode || f.dropoffPostcode,
                            dropoffCity: p.city || f.dropoffCity,
                          }))
                        }
                        placeholder="E.g. 45 Richmond Hill"
                      />
                      {errors.dropoffAddress && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.dropoffAddress}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        Postcode
                      </label>
                      <input
                        className={[
                          "w-full border bg-transparent px-4 py-3 text-sm uppercase tracking-wide focus:outline-none",
                          errors.dropoffPostcode ? "border-accent" : "border-primary",
                        ].join(" ")}
                        placeholder="E.g. TW10 6RW"
                        type="text"
                        value={form.dropoffPostcode}
                        onChange={set("dropoffPostcode")}
                      />
                      {errors.dropoffPostcode && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.dropoffPostcode}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        City
                      </label>
                      <input
                        className={[
                          "w-full border bg-transparent px-4 py-3 text-sm uppercase tracking-wide focus:outline-none",
                          errors.dropoffCity ? "border-accent" : "border-primary",
                        ].join(" ")}
                        placeholder="E.g. Richmond"
                        type="text"
                        value={form.dropoffCity}
                        onChange={set("dropoffCity")}
                      />
                      {errors.dropoffCity && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.dropoffCity}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        Recipient name
                      </label>
                      <input
                        className={[
                          "w-full border bg-transparent px-4 py-3 text-sm uppercase tracking-wide focus:outline-none",
                          errors.recipientName ? "border-accent" : "border-primary",
                        ].join(" ")}
                        placeholder="Full name"
                        type="text"
                        value={form.recipientName}
                        onChange={set("recipientName")}
                      />
                      {errors.recipientName && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.recipientName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-4">
                      <label className="block text-[10px] font-extrabold tracking-wide text-primary">
                        Recipient phone
                      </label>
                      <input
                        className={[
                          "w-full border bg-transparent px-4 py-3 text-sm uppercase tracking-wide focus:outline-none",
                          errors.recipientPhone ? "border-accent" : "border-primary",
                        ].join(" ")}
                        placeholder="+44 7000 000000"
                        type="tel"
                        value={form.recipientPhone}
                        onChange={set("recipientPhone")}
                      />
                      {errors.recipientPhone && (
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                          {errors.recipientPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </form>
            </div>

            {submitError && (
              <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                {submitError}
              </p>
            )}
            <div className="mx-auto mt-4 flex max-w-4xl items-center justify-between border-t border-slate-100 pt-6">
              <Link
                href="/book/type"
                className="group flex items-center gap-2 pl-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">
                  arrow_back
                </span>
                Back
              </Link>
              <button
                onClick={handleContinue}
                className="btn-press btn-sweep flex items-center gap-3 bg-primary px-8 py-3 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-black"
              >
                Continue
                <span className="material-symbols-outlined text-base text-accent">east</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
