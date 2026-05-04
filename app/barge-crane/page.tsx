import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function BargeCranePage() {
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
          BARGE & CRANE FLOW OPERATIONS
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
          BARGE-402 Operations
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
          Real-time logistical choreography of loading and unloading
          sequences. Tracks BARGE-402 operations alongside shoreside crane
          movements at the ADM Waggaman Terminal.
        </p>

        {/* Flow Diagram */}
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
            marginBottom: 48,
            position: "relative",
            overflow: "hidden",
            padding: 32,
          }}
          role="img"
          aria-label="Barge and crane flow diagram showing BARGE-402 loading sequence with shoreside crane operations"
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 800 260"
            fill="none"
            aria-hidden="true"
          >
            {/* River */}
            <rect x="0" y="180" width="800" height="80" fill="rgba(99, 102, 241, 0.05)" />
            <text x="400" y="230" textAnchor="middle" fill="var(--white-dim)" fontSize="10" fontFamily="var(--font-jetbrains-mono)">MISSISSIPPI RIVER FLOW →</text>

            {/* Dock wall */}
            <line x1="0" y1="180" x2="800" y2="180" stroke="var(--indigo-400)" strokeWidth="2" />

            {/* Barge */}
            <rect x="100" y="140" width="200" height="40" rx="3" fill="rgba(99, 102, 241, 0.12)" stroke="var(--indigo-500)" strokeWidth="1.5" />
            <text x="200" y="164" textAnchor="middle" fill="var(--indigo-400)" fontSize="11" fontFamily="var(--font-jetbrains-mono)">BARGE-402</text>

            {/* Crane 1 */}
            <line x1="180" y1="30" x2="180" y2="180" stroke="var(--white-dim)" strokeWidth="2" />
            <line x1="180" y1="30" x2="240" y2="30" stroke="var(--white-dim)" strokeWidth="2" />
            <line x1="240" y1="30" x2="240" y2="80" stroke="var(--white-dim)" strokeWidth="1" strokeDasharray="4 4" />
            <text x="180" y="22" textAnchor="middle" fill="var(--white-dim)" fontSize="9" fontFamily="var(--font-jetbrains-mono)">CRANE-01</text>

            {/* Crane 2 */}
            <line x1="380" y1="30" x2="380" y2="180" stroke="var(--white-dim)" strokeWidth="2" />
            <line x1="380" y1="30" x2="440" y2="30" stroke="var(--white-dim)" strokeWidth="2" />
            <line x1="440" y1="30" x2="440" y2="80" stroke="var(--white-dim)" strokeWidth="1" strokeDasharray="4 4" />
            <text x="380" y="22" textAnchor="middle" fill="var(--white-dim)" fontSize="9" fontFamily="var(--font-jetbrains-mono)">CRANE-02</text>

            {/* Cargo hatches on barge */}
            <rect x="115" y="148" width="30" height="24" rx="1" fill="rgba(99, 102, 241, 0.2)" stroke="var(--indigo-400)" strokeWidth="0.5" />
            <rect x="155" y="148" width="30" height="24" rx="1" fill="rgba(99, 102, 241, 0.2)" stroke="var(--indigo-400)" strokeWidth="0.5" />
            <rect x="195" y="148" width="30" height="24" rx="1" fill="rgba(99, 102, 241, 0.2)" stroke="var(--indigo-400)" strokeWidth="0.5" />
            <rect x="235" y="148" width="30" height="24" rx="1" fill="rgba(99, 102, 241, 0.2)" stroke="var(--indigo-400)" strokeWidth="0.5" />
            <rect x="255" y="148" width="30" height="24" rx="1" fill="rgba(99, 102, 241, 0.2)" stroke="var(--indigo-400)" strokeWidth="0.5" />

            {/* Shore infrastructure */}
            <rect x="500" y="100" width="120" height="80" rx="3" fill="rgba(15, 15, 23, 0.8)" stroke="var(--dark-matter-border)" strokeWidth="1" />
            <text x="560" y="145" textAnchor="middle" fill="var(--white-dim)" fontSize="9" fontFamily="var(--font-jetbrains-mono)">SILO STORAGE</text>

            {/* Conveyor */}
            <line x1="440" y1="140" x2="500" y2="140" stroke="var(--white-dim)" strokeWidth="1" strokeDasharray="6 3" />
            <text x="470" y="134" textAnchor="middle" fill="var(--white-dim)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">CONVEYOR</text>

            {/* Flow arrows */}
            <text x="680" y="100" textAnchor="middle" fill="var(--white-dim)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">29.9010°N · 90.2140°W</text>
          </svg>
        </div>

        {/* Operation Details */}
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
              BARGE-402
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
              Active hopper barge assigned to the Waggaman Terminal.
              Capacity ceiling of 1,482.6 T. Equipped with five cargo
              holds for bulk grain transport.
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
              CRANE OPERATIONS
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
              Dual shoreside cranes coordinate loading and unloading
              sequences. Crane-01 and Crane-02 operate in staggered
              cycles to maintain continuous cargo flow from barge to
              silo storage.
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
              CARGO LOCK SEQUENCE
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
              Cargo lock sequences track load integrity up to the
              1,482.6 T capacity ceiling. Each hold is sealed and
              verified before the barge is cleared for transit.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
