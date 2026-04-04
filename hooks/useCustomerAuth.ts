"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export function useCustomerAuth(): AuthUser | null {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      setUser({
        id: user.id,
        name: user.user_metadata?.full_name ?? user.email ?? "",
        email: user.email ?? "",
      });
    });
  }, [router]);

  return user;
}
