import Header from "@/components/Header";
import Footer from "@/components/Footer";

const cargoHolds = [
  { id: "H1", capacity: "296.5 T", status: "LOCKED", pct: 100 },
  { id: "H2", capacity: "296.5 T", status: "LOCKED", pct: 100 },
  { id: "H3", capacity: "296.5 T", status: "LOCKED", pct: 100 },
  { id: "H4", capacity: "296.5 T", status: "LOCKED", pct: 100 },
  { id: "H5", capacity: "296.6 T", status: "LOCKED", pct: 100 },
];

export default function CargoSystemPage() {
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
          CARGO SYSTEM
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
          Cargo Lock & Capacity
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
          Full cargo integrity monitoring for BARGE-402. Cargo lock
          sequences up to the 1,482.6 T capacity ceiling. Each hold is
          sealed, verified, and tracked through the complete loading
          cycle.
        </p>

        {/* Total Capacity */}
        <div
          style={{
            padding: 32,
            background: "var(--dark-matter-raised)",
            border: "1px solid var(--dark-matter-border)",
            borderRadius: "var(--radius-lg)",
            marginBottom: 32,
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <span
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontSize: "var(--text-3xl)",
              fontWeight: 700,
              color: "var(--white)",
            }}
          >
            1,482.6 T
          </span>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "var(--text-sm)",
              color: "var(--indigo-400)",
              letterSpacing: "0.05em",
            }}
          >
            TOTAL CAPACITY CEILING
          </span>
        </div>

        {/* Hold Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 48,
          }}
        >
          {cargoHolds.map((hold) => (
            <div
              key={hold.id}
              style={{
                padding: 24,
                background: "var(--dark-matter-raised)",
                border: "1px solid var(--dark-matter-border)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "var(--text-sm)",
                    color: "var(--white)",
                    fontWeight: 500,
                  }}
                >
                  {hold.id}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono)",
                    fontSize: "var(--text-xs)",
                    color: "var(--indigo-400)",
                    padding: "2px 8px",
                    background: "rgba(99, 102, 241, 0.1)",
                    borderRadius: "var(--radius-full)",
                    letterSpacing: "0.05em",
                  }}
                >
                  {hold.status}
                </span>
              </div>

              <span
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-space-grotesk)",
                  fontSize: "var(--text-xl)",
                  fontWeight: 600,
                  color: "var(--white)",
                  display: "block",
                  marginBottom: 12,
                }}
              >
                {hold.capacity}
              </span>

              {/* Capacity bar */}
              <div
                style={{
                  width: "100%",
                  height: 4,
                  background: "var(--dark-matter-border)",
                  borderRadius: "var(--radius-full)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${hold.pct}%`,
                    height: "100%",
                    background: "var(--indigo-500)",
                    borderRadius: "var(--radius-full)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Cargo Flow Diagram */}
        <div
          style={{
            aspectRatio: "720/320",
            width: "100%",
            maxWidth: 900,
            background: "var(--dark-matter-raised)",
            border: "1px solid var(--dark-matter-border)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 32,
            marginBottom: 48,
          }}
          role="img"
          aria-label="Cargo flow diagram showing the loading sequence from crane to barge holds to silo storage"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 700 200"
            fill="none"
            aria-hidden="true"
          >
            {/* Crane */}
            <line x1="100" y1="20" x2="100" y2="140" stroke="var(--white-dim)" strokeWidth="2" />
            <line x1="100" y1="20" x2="160" y2="20" stroke="var(--white-dim)" strokeWidth="2" />
            <line x1="160" y1="20" x2="160" y2="60" stroke="var(--white-dim)" strokeWidth="1" strokeDasharray="4 4" />
            <text x="100" y="160" textAnchor="middle" fill="var(--white-dim)" fontSize="9" fontFamily="var(--font-jetbrains-mono)">CRANE</text>

            {/* Arrow 1 */}
            <line x1="170" y1="80" x2="230" y2="80" stroke="var(--indigo-400)" strokeWidth="1.5" />
            <polygon points="230,76 238,80 230,84" fill="var(--indigo-400)" />
            <text x="200" y="72" textAnchor="middle" fill="var(--white-dim)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">LOAD</text>

            {/* Barge holds */}
            <rect x="240" y="50" width="50" height="60" rx="2" fill="rgba(99, 102, 241, 0.12)" stroke="var(--indigo-500)" strokeWidth="1" />
            <rect x="300" y="50" width="50" height="60" rx="2" fill="rgba(99, 102, 241, 0.12)" stroke="var(--indigo-500)" strokeWidth="1" />
            <rect x="360" y="50" width="50" height="60" rx="2" fill="rgba(99, 102, 241, 0.12)" stroke="var(--indigo-500)" strokeWidth="1" />
            <text x="265" y="85" textAnchor="middle" fill="var(--indigo-400)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">H1</text>
            <text x="325" y="85" textAnchor="middle" fill="var(--indigo-400)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">H2</text>
            <text x="385" y="85" textAnchor="middle" fill="var(--indigo-400)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">H3</text>
            <text x="325" y="130" textAnchor="middle" fill="var(--white-dim)" fontSize="9" fontFamily="var(--font-jetbrains-mono)">BARGE-402 HOLDS</text>

            {/* Arrow 2 */}
            <line x1="420" y1="80" x2="480" y2="80" stroke="var(--indigo-400)" strokeWidth="1.5" />
            <polygon points="480,76 488,80 480,84" fill="var(--indigo-400)" />
            <text x="450" y="72" textAnchor="middle" fill="var(--white-dim)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">LOCK</text>

            {/* Silo */}
            <rect x="490" y="40" width="80" height="80" rx="3" fill="rgba(15, 15, 23, 0.8)" stroke="var(--dark-matter-border)" strokeWidth="1" />
            <text x="530" y="85" textAnchor="middle" fill="var(--white-dim)" fontSize="9" fontFamily="var(--font-jetbrains-mono)">SILO</text>

            {/* Capacity label */}
            <text x="350" y="180" textAnchor="middle" fill="var(--white-dim)" fontSize="9" fontFamily="var(--font-jetbrains-mono)">1,482.6 T CAPACITY CEILING</text>
          </svg>
        </div>

        {/* Info cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          <div
            style={{
              padding: 24,
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
              }}
            >
              LOCK VERIFICATION
            </span>
            <p
              style={{
                fontFamily: "var(--font-ibm-plex-sans)",
                fontSize: "var(--text-base)",
                color: "var(--white-muted)",
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              Each cargo hold undergoes a sealed verification process
              before the barge is cleared for transit. Lock status is
              monitored in real-time through the FREQ AI system.
            </p>
          </div>

          <div
            style={{
              padding: 24,
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
              }}
            >
              INTEGRITY MONITORING
            </span>
            <p
              style={{
                fontFamily: "var(--font-ibm-plex-sans)",
                fontSize: "var(--text-base)",
                color: "var(--white-muted)",
                marginTop: 8,
                lineHeight: 1.6,
              }}
            >
              Continuous cargo integrity monitoring ensures no hold
              exceeds its rated capacity. The system flags any
              deviation from the expected load distribution across
              all five holds.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
