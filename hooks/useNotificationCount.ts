"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useNotificationCount(userId: string | null) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // Fetch initial count
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false)
      .then(({ count: c }) => {
        setCount(c ?? 0);
      });

    // Subscribe to new notifications
    const channel = supabase
      .channel(`notif-count-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          setCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Decrement when notification is marked as read
          if (payload.new && (payload.new as { is_read: boolean }).is_read) {
            setCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return count;
}
