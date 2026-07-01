"use client";

import { LandingHeader } from "./LandingHeader";
import { CustomerTopBar } from "./CustomerTopBar";

/**
 * Top bar for the booking wizard. Guests (anonymous sessions) keep the public
 * landing navbar — we don't flip them onto the customer navbar (dashboard /
 * orders / notifications / sign-out) until they've created a real account at
 * checkout. Logged-in customers get the normal `CustomerTopBar`.
 */
export function BookingTopBar({ isAnonymous }: { isAnonymous: boolean }) {
  if (isAnonymous) {
    return (
      <div className="px-4 sm:px-6 lg:px-8">
        <LandingHeader />
      </div>
    );
  }
  return <CustomerTopBar />;
}
