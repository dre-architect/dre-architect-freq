import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeadCaptureForm from "@/components/LeadCaptureForm";

const metrics = [
  {
    label: "Autonomous Survey",
    value: "14 min",
    detail: "vs. ~4 hr manual baseline",
  },
  {
    label: "Draft Accuracy",
    value: "±0.02 ft",
    detail: "LiDAR-measured waterline delta",
  },
  {
    label: "Crew Deck Exposure",
    value: "0",
    detail: "incidents (Fully remote)",
  },
  {
    label: "Max Cargo Lock",
    value: "1,482.6 T",
    detail: "BARGE-402 hopper capacity",
  },
  {
    label: "Mean Draft",
    value: "12.45 ft",
    detail: "Calibrated across six stations",
  },
  {
    label: "Draft Stations",
    value: "6 pts",
    detail: "FP, FS, MP, MS, AP, AS",
  },
];

export default function SimulationGroundsPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <main style={{ flex: 1, padding: "64px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <span
          style={{
            display: "inline-block",
            fontFamily: "var(--font-jetbrains-mono)",
            fontSize: "var(--text-xs)",
            color: "var(--indigo-400)",
            letterSpacing: "0.08em",
            marginBottom: 16,
          }}
        >
          SIMULATION GROUNDS
        </span>

        <h1
          style={{
            fontSize: "var(--text-3xl)",
            fontWeight: 700,
            color: "var(--white)",
            marginBottom: 16,
            lineHeight: 1.1,
          }}
        >
          Platform Metrics
        </h1>

        <p
          style={{
            fontFamily: "var(--font-ibm-plex-sans)",
            fontSize: "var(--text-lg)",
            color: "var(--white-muted)",
            maxWidth: 640,
            lineHeight: 1.6,
            marginBottom: 48,
          }}
        >
          Locked operational constants from the ADM Waggaman Terminal
          deployment. These are measured values, not estimates. All
          numeric data uses tabular-nums formatting to prevent font
          shift.
        </p>

        {/* Metrics Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 80,
          }}
          aria-label="Sovereign operational metrics"
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                padding: 28,
                background: "var(--dark-matter-raised)",
                border: "1px solid var(--dark-matter-border)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--indigo-400)",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                {metric.label.toUpperCase()}
              </span>
              <span
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontSize: "var(--text-2xl)",
                  fontWeight: 700,
                  color: "var(--white)",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                {metric.value}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-ibm-plex-sans)",
                  fontSize: "var(--text-sm)",
                  color: "var(--white-dim)",
                }}
              >
                {metric.detail}
              </span>
            </div>
          ))}
        </div>

        {/* Lead Capture */}
        <section
          style={{
            borderTop: "1px solid var(--dark-matter-border)",
            paddingTop: 64,
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
            Interested in deploying FREQ AI at your terminal? Submit
            your details and our team will reach out.
          </p>
          <LeadCaptureForm />
        </section>
      </main>

      <Footer />
    </div>
  );
}
