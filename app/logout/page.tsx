"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.auth.signOut(),
      fetch("/api/auth/clear-admin-mfa", { method: "POST" }),
    ]).then(() => {
      router.replace("/login");
    });
  }, [router]);

  return null;
}
