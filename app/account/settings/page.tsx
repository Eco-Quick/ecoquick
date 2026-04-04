"use client";

import { useState, useEffect } from "react";
import { CustomerMobileNav } from "../../../components/layout/CustomerMobileNav";
import { CustomerTopBar } from "@/components/layout/CustomerTopBar";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { createClient } from "@/lib/supabase/client";

export default function AccountSettingsPage() {
  const user = useCustomerAuth();
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const nameParts = user?.name?.split(" ") ?? [];
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" ") ?? "");
  const [phone, setPhone] = useState("");

  const [notifs, setNotifs] = useState({
    deliveryUpdates: true,
    marketingEmails: false,
    smsAlerts: true,
  });

  useEffect(() => {
    if (!user) return;
    const parts = user.name?.split(" ") ?? [];
    setFirstName(parts[0] ?? "");
    setLastName(parts.slice(1).join(" ") ?? "");
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setPhone(data.user?.user_metadata?.phone_number ?? "");
    });
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: `${firstName} ${lastName}`.trim(),
        phone_number: phone,
      },
    });
    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }

  if (!user) return null;

  return (
    <div className="page-fade min-h-screen bg-slate-50 text-slate-900">
      <CustomerTopBar />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 md:py-12">
        <header className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">
              Account settings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update your personal details and notification preferences.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-press btn-sweep mt-2 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black disabled:opacity-60 md:mt-0"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </header>

        {saveSuccess && (
          <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
            Changes saved successfully.
          </div>
        )}
        {saveError && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {saveError}
          </div>
        )}

        {/* Personal information */}
        <section className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Personal information</h2>
          <p className="mt-1 text-sm text-slate-500">
            This is how we’ll address you in your dashboard and delivery updates.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                First name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Last name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={user.email ?? ""}
                disabled
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-medium text-slate-600">
                Phone number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+44 000 000 0000"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="mb-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Notifications</h2>
          <p className="mt-1 text-sm text-slate-500">
            Choose how you’d like to hear from us.
          </p>

          <div className="mt-6 space-y-4">
            {([
              {
                key: "deliveryUpdates" as const,
                title: "Delivery updates",
                body: "Push notifications for live tracking.",
              },
              {
                key: "marketingEmails" as const,
                title: "Marketing emails",
                body: "Occasional offers and eco-tips.",
              },
              {
                key: "smsAlerts" as const,
                title: "SMS alerts",
                body: "Critical account and security notices.",
              },
            ] as const).map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 rounded-md border border-slate-100 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.body}</p>
                </div>
                <label className="inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={notifs[item.key]}
                    onChange={(e) =>
                      setNotifs((n) => ({ ...n, [item.key]: e.target.checked }))
                    }
                  />
                  <div
                    className={`relative h-5 w-9 rounded-full transition-colors ${
                      notifs[item.key] ? "bg-primary" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        notifs[item.key] ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </section>
      </main>

      <CustomerMobileNav />
    </div>
  );
}
