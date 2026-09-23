"use client";

import { useEffect } from "react";

/** Clears document scroll locks left by the site search modal when entering admin. */
export function AdminScrollUnlock() {
  useEffect(() => {
    document.body.style.removeProperty("overflow");
    document.documentElement.style.removeProperty("overflow");
  }, []);

  return null;
}
