import { createServiceClient } from "@/lib/supabase/service";
import { PricingBandsEditor } from "./PricingBandsEditor";
import { SurchargeToggle } from "./SurchargeToggle";

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const service = createServiceClient();
  const [bandsRes, surchargeRes] = await Promise.all([
    service.from("pricing_bands").select("id, label, up_to_miles, price").order("sort_order", { ascending: true }),
    service.from("pricing_surcharge").select("id, enabled, amount, reason, updated_at").limit(1).maybeSingle(),
  ]);

  return (
    <div>
      <div className="mb-8">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Operations
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
          PRICING
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-zinc-400">
          Base delivery pricing by distance. Changes apply to every new booking immediately —
          existing orders keep their original price. For a one-off surge or discount on a
          single order, adjust it from that order's detail page instead.
        </p>
      </div>

      <div className="space-y-6">
        {surchargeRes.data && <SurchargeToggle surcharge={surchargeRes.data} />}
        <PricingBandsEditor bands={bandsRes.data ?? []} />
      </div>
    </div>
  );
}
