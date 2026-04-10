"use client";

import { useEffect, useState } from "react";

type Status = "loading" | "verified" | "pending" | "unverified";

export function useVerificationGuard(): Status {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    fetch("/api/verification/status")
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.status === "verified" ? "verified" : data.status === "pending" ? "pending" : "unverified");
      })
      .catch(() => setStatus("unverified"));
  }, []);

  return status;
}
