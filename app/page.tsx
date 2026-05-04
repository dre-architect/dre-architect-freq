"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const sections = [
  {
    href: "/digital-twin",
    label: "Phase 3 Digital Twin",
    description:
      "The definitive 3D visualization layer of the ADM Waggaman Terminal. Reserved UE5 Pixel Streaming endpoint for live spatial oversight.",
    tag: "DIGITAL TWIN",
  },
  {
    href: "/barge-crane",
    label: "Barge & Crane Flow Operations",
    description:
      "Real-time logistical choreography of loading and unloading sequences. BARGE-402 operations alongside shoreside crane movements.",
    tag: "BARGE & CRANE",
  },
  {
    href: "/cargo-system",
    label: "Cargo System",
    description:
      "Cargo lock sequences up to the 1,482.6 T capacity ceiling. Full hopper capacity tracking and cargo integrity monitoring.",
    tag: "CARGO SYSTEM",
  },
  {
    href: "/lidar",
    label: "LiDAR Autonomous Draft Survey",
    description:
      "Raw sensory input of the FREQ AI scanning process. 140-point deterministic cloud with six draft station markers.",
    tag: "LiDAR",
  },
  {
    href: "/simulation-grounds",
    label: "Simulation Grounds",
    description:
      "Locked operational constants and platform metrics. Autonomous survey, draft accuracy, crew exposure, and cargo data.",
    tag: "SIMULATION",
  },
];

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section
          style={{
            padding: "80px 24px 64px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
          aria-label="Hero"
        >
          {/* Status Pill */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 16px",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              borderRadius: "var(--radius-full)",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--indigo-400)",
                display: "inline-block",
              }}
              aria-hidden="true"
            />
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--indigo-400)",
                letterSpacing: "0.05em",
              }}
            >
              LIVE · PHASE 3 DIGITAL TWIN PREVIEW
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 700,
              color: "var(--white)",
              maxWidth: 800,
              lineHeight: 1.1,
              marginBottom: 24,
            }}
          >
            Autonomous maritime cargo intelligence,{" "}
            <span
              style={{
                color: "var(--indigo-400)",
                textShadow: "0 0 40px rgba(129, 140, 248, 0.3)",
              }}
            >
              surveyed in minutes.
            </span>
          </h1>

          <p
            style={{
              fontFamily: "var(--font-ibm-plex-sans)",
              fontSize: "var(--text-lg)",
              color: "var(--white-muted)",
              maxWidth: 600,
              lineHeight: 1.6,
              marginBottom: 40,
            }}
          >
            Deployed at the ADM Waggaman Terminal on the Mississippi River.
            FREQ AI replaces manual survey processes with autonomous LiDAR
            scanning and real-time cargo intelligence.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <Link
              href="/simulation-grounds"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 28px",
                background: "var(--indigo-500)",
                color: "var(--white)",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-ibm-plex-sans)",
                fontSize: "var(--text-base)",
                fontWeight: 600,
                textDecoration: "none",
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
              View Platform Metrics
            </Link>
            <Link
              href="/digital-twin"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 28px",
                background: "transparent",
                color: "var(--white-muted)",
                border: "2px solid var(--dark-matter-border)",
                borderRadius: "var(--radius-full)",
                fontFamily: "var(--font-ibm-plex-sans)",
                fontSize: "var(--text-base)",
                fontWeight: 500,
                textDecoration: "none",
                minHeight: 44,
                transition: "border-color 0.15s ease, color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--indigo-400)";
                e.currentTarget.style.color = "var(--white)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--dark-matter-border)";
                e.currentTarget.style.color = "var(--white-muted)";
              }}
            >
              Enter Digital Twin
            </Link>
          </div>
        </section>

        {/* Section Grid */}
        <section
          style={{
            padding: "0 24px 80px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
          aria-label="Simulation grounds navigation"
        >
          <h2
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 600,
              color: "var(--white)",
              marginBottom: 40,
            }}
          >
            Simulation Grounds
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 20,
            }}
          >
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                style={{
                  display: "block",
                  padding: 28,
                  background: "var(--dark-matter-raised)",
                  border: "1px solid var(--dark-matter-border)",
                  borderRadius: "var(--radius-lg)",
                  textDecoration: "none",
                  transition:
                    "border-color 0.15s ease, background 0.15s ease",
                  minHeight: 44,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(99, 102, 241, 0.3)";
                  e.currentTarget.style.background =
                    "rgba(15, 15, 23, 0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "var(--dark-matter-border)";
                  e.currentTarget.style.background =
                    "var(--dark-matter-raised)";
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "var(--text-xs)",
                    color: "var(--indigo-400)",
                    letterSpacing: "0.08em",
                    marginBottom: 12,
                  }}
                >
                  {section.tag}
                </span>
                <h3
                  style={{
                    fontSize: "var(--text-xl)",
                    fontWeight: 600,
                    color: "var(--white)",
                    marginBottom: 8,
                  }}
                >
                  {section.label}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-ibm-plex-sans)",
                    fontSize: "var(--text-sm)",
                    color: "var(--white-dim)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {section.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Lead Capture */}
        <section
          style={{
            padding: "80px 24px",
            maxWidth: 1200,
            margin: "0 auto",
            borderTop: "1px solid var(--dark-matter-border)",
          }}
          aria-label="Partnership inquiry"
        >
          <h2
            style={{
              fontSize: "var(--text-2xl)",
              fontWeight: 600,
              color: "var(--white)",
              marginBottom: 8,
            }}
          >
            Partnership & Capital Inquiries
          </h2>
          <p
            style={{
              fontFamily: "var(--font-ibm-plex-sans)",
              fontSize: "var(--text-base)",
              color: "var(--white-dim)",
              marginBottom: 32,
              maxWidth: 480,
            }}
          >
            Interested in deploying FREQ AI at your terminal? Submit your
            details and our team will reach out.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
