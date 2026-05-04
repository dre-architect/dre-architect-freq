"use client";

import { useEffect } from "react";

export default function ErrorCapture() {
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      const body = {
        message: event.message || "",
        source: event.filename || "",
        lineno: event.lineno || 0,
        colno: event.colno || 0,
        url: window.location.href,
        user_agent: navigator.userAgent,
      };

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (supabaseUrl && supabaseKey) {
        fetch(`${supabaseUrl}/rest/v1/client_errors`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Prefer: "return=minimal",
          },
          body: JSON.stringify(body),
        }).catch(() => {});
      }
    };

    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  return null;
}
