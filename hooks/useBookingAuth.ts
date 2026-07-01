"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export type BookingUser = {
  id: string;
  isAnonymous: boolean;
  name: string;
  email: string | null;
};

export type BookingAuth = {
  user: BookingUser | null;
  /** Non-null when we couldn't establish a session (e.g. anonymous sign-ins disabled). */
  error: string | null;
};

/**
 * Auth hook for the booking wizard. Unlike `useCustomerAuth`, this NEVER redirects
 * to /login. If there is no session, it silently creates a Supabase anonymous
 * session so a brand-new visitor can build an order without signing up first.
 * The anonymous user is upgraded to a permanent account at checkout
 * (see /api/auth/convert-guest), keeping the same auth.uid().
 *
 * If the anonymous session can't be created (most commonly because Anonymous
 * Sign-Ins are disabled in the Supabase dashboard), `error` is set so the page
 * can show a fallback instead of hanging on a blank screen.
 */
export function useBookingAuth(): BookingAuth {
  const [user, setUser] = useState<BookingUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      try {
        let { data: { user: u } } = await supabase.auth.getUser();

        if (!u) {
          const { data, error: signInError } = await supabase.auth.signInAnonymously();
          if (signInError) {
            if (!cancelled) {
              setError(
                signInError.message?.toLowerCase().includes("anonymous")
                  ? "Guest checkout isn't enabled yet. Please sign in to continue."
                  : "We couldn't start your session. Please sign in to continue."
              );
            }
            return;
          }
          u = data.user;
        }

        if (!cancelled && u) {
          setUser({
            id: u.id,
            isAnonymous: u.is_anonymous ?? false,
            name: u.user_metadata?.full_name ?? u.email ?? "",
            email: u.email ?? null,
          });
        }
      } catch {
        if (!cancelled) {
          setError("We couldn't start your session. Please sign in to continue.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { user, error };
}
