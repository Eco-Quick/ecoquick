import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminCodeVerifyForm } from "@/components/admin/AdminCodeVerifyForm";

export default async function VerifyAdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.app_metadata?.role !== "admin") redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-[#050507]">
      <AdminCodeVerifyForm email={user.email ?? ""} />
    </div>
  );
}
