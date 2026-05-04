import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DigitalTwinPage() {
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
          PHASE 3 DIGITAL TWIN
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
          ADM Waggaman Terminal
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
          The definitive 3D visualization layer of the Waggaman Terminal.
          This component houses a reserved slot for a live Unreal Engine 5
          Pixel Streaming endpoint, providing real-time spatial oversight of
          all terminal operations.
        </p>

        {/* UE5 Preview Panel */}
        <div
          style={{
            aspectRatio: "720/320",
            width: "100%",
            maxWidth: 900,
            background: "var(--dark-matter-raised)",
            border: "1px solid var(--dark-matter-border)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            marginBottom: 48,
            position: "relative",
            overflow: "hidden",
          }}
          role="img"
          aria-label="Digital twin preview of ADM Waggaman Terminal. A live UE5 Pixel Streaming endpoint will be available here."
        >
          {/* Grid overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(28, 28, 42, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(28, 28, 42, 0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              pointerEvents: "none",
            }}
          />

          {/* Terminal outline representation */}
          <svg
            width="320"
            height="160"
            viewBox="0 0 320 160"
            fill="none"
            style={{ position: "relative", zIndex: 1 }}
            aria-hidden="true"
          >
            {/* River */}
            <rect x="0" y="120" width="320" height="40" fill="rgba(99, 102, 241, 0.08)" stroke="rgba(99, 102, 241, 0.2)" strokeWidth="1" />
            <text x="160" y="145" textAnchor="middle" fill="var(--white-dim)" fontSize="10" fontFamily="var(--font-jetbrains-mono)">MISSISSIPPI RIVER</text>

            {/* Dock wall */}
            <line x1="20" y1="120" x2="300" y2="120" stroke="var(--indigo-400)" strokeWidth="2" />

            {/* Barge */}
            <rect x="80" y="100" width="120" height="20" rx="2" fill="rgba(99, 102, 241, 0.15)" stroke="var(--indigo-500)" strokeWidth="1" />
            <text x="140" y="114" textAnchor="middle" fill="var(--indigo-400)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">BARGE-402</text>

            {/* Crane */}
            <line x1="220" y1="40" x2="220" y2="120" stroke="var(--white-dim)" strokeWidth="2" />
            <line x1="220" y1="40" x2="260" y2="40" stroke="var(--white-dim)" strokeWidth="2" />
            <line x1="260" y1="40" x2="260" y2="70" stroke="var(--white-dim)" strokeWidth="1" strokeDasharray="4 4" />

            {/* Terminal building */}
            <rect x="20" y="60" width="60" height="60" rx="2" fill="rgba(15, 15, 23, 0.8)" stroke="var(--dark-matter-border)" strokeWidth="1" />
            <text x="50" y="95" textAnchor="middle" fill="var(--white-dim)" fontSize="7" fontFamily="var(--font-jetbrains-mono)">ADM</text>

            {/* Coordinate label */}
            <text x="300" y="20" textAnchor="end" fill="var(--white-dim)" fontSize="8" fontFamily="var(--font-jetbrains-mono)">29.9010°N · 90.2140°W</text>
          </svg>

          <p
            style={{
              fontFamily: "var(--font-jetbrains-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--white-dim)",
              margin: 0,
              position: "relative",
              zIndex: 1,
            }}
          >
            UE5 PIXEL STREAMING ENDPOINT — STANDBY
          </p>
        </div>

        {/* Info Grid */}
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
              ENDPOINT STATUS
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
              The UE5 Pixel Streaming endpoint is reserved for live spatial
              oversight. Upon activation, this panel will swap from the
              static rendering to a live interactive stream.
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
              SITE LOCATION
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
              ADM Waggaman Terminal, Mississippi River. Coordinates:
              29.9010°N, 90.2140°W. The digital twin replicates all
              physical infrastructure, crane positions, and barge mooring
              points.
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
              CAPABILITIES
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
              Real-time spatial oversight of terminal operations. Live barge
              tracking, crane positioning, and cargo load state
              visualization. Full integration with LiDAR draft survey data.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
