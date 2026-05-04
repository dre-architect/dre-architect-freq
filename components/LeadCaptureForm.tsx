"use client";

import { useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

export default function LeadCaptureForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");

    const { error } = await supabase.from("leads").insert({
      email,
      name,
      organization: org,
    });

    if (error) {
      setStatus("error");
    } else {
      setStatus("success");
      setEmail("");
      setName("");
      setOrg("");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        maxWidth: 480,
        width: "100%",
      }}
      aria-label="Partnership inquiry form"
    >
      <div>
        <label
          htmlFor="lead-name"
          style={{
            display: "block",
            fontFamily: "var(--font-ibm-plex-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--white-muted)",
            marginBottom: 6,
          }}
        >
          Name
        </label>
        <input
          id="lead-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "var(--dark-matter)",
            border: "1px solid var(--dark-matter-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--white)",
            fontFamily: "var(--font-ibm-plex-sans)",
            fontSize: "var(--text-base)",
            outline: "none",
            minHeight: 44,
          }}
        />
      </div>

      <div>
        <label
          htmlFor="lead-email"
          style={{
            display: "block",
            fontFamily: "var(--font-ibm-plex-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--white-muted)",
            marginBottom: 6,
          }}
        >
          Email
        </label>
        <input
          id="lead-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "var(--dark-matter)",
            border: "1px solid var(--dark-matter-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--white)",
            fontFamily: "var(--font-ibm-plex-sans)",
            fontSize: "var(--text-base)",
            outline: "none",
            minHeight: 44,
          }}
        />
      </div>

      <div>
        <label
          htmlFor="lead-org"
          style={{
            display: "block",
            fontFamily: "var(--font-ibm-plex-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--white-muted)",
            marginBottom: 6,
          }}
        >
          Organization
        </label>
        <input
          id="lead-org"
          type="text"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "var(--dark-matter)",
            border: "1px solid var(--dark-matter-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--white)",
            fontFamily: "var(--font-ibm-plex-sans)",
            fontSize: "var(--text-base)",
            outline: "none",
            minHeight: 44,
          }}
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        style={{
          padding: "12px 24px",
          background: "var(--indigo-500)",
          color: "var(--white)",
          border: "none",
          borderRadius: "var(--radius-full)",
          fontFamily: "var(--font-ibm-plex-sans)",
          fontSize: "var(--text-base)",
          fontWeight: 600,
          cursor: status === "loading" ? "wait" : "pointer",
          minHeight: 44,
          transition: "background 0.15s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--indigo-600)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "var(--indigo-500)";
        }}
      >
        {status === "loading" ? "Submitting..." : "Submit Inquiry"}
      </button>

      {status === "success" && (
        <p
          style={{
            fontFamily: "var(--font-ibm-plex-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--indigo-400)",
            margin: 0,
          }}
        >
          Inquiry received. We will be in touch.
        </p>
      )}
      {status === "error" && (
        <p
          style={{
            fontFamily: "var(--font-ibm-plex-sans)",
            fontSize: "var(--text-sm)",
            color: "var(--white-muted)",
            margin: 0,
          }}
        >
          Submission failed. Please try again.
        </p>
      )}
    </form>
  );
}
