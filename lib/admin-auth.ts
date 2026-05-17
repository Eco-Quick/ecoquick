import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * Server-side admin gate. Call at the top of any admin server component / route.
 * Redirects to /login if unauthenticated, /dashboard if logged in without admin role.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role as string | undefined;
  if (role !== "admin") {
    redirect(role === "driver" ? "/driver" : "/dashboard");
  }

  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.full_name as string) ?? user.email ?? "Admin",
  };
}
