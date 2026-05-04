"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useRef } from "react";

const STATION_MARKERS = [
  { id: "FP", x: 0.1, y: 0.5 },
  { id: "FS", x: 0.25, y: 0.5 },
  { id: "MP", x: 0.4, y: 0.5 },
  { id: "MS", x: 0.6, y: 0.5 },
  { id: "AP", x: 0.75, y: 0.5 },
  { id: "AS", x: 0.9, y: 0.5 },
];

function generateDeterministicPoints(count: number, seed: number) {
  const points: { x: number; y: number }[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 0) % 2147483647;
    const x = (s % 1000) / 1000;
    s = (s * 16807 + 0) % 2147483647;
    const y = (s % 1000) / 1000;
    points.push({ x: x * 0.8 + 0.1, y: y * 0.6 + 0.2 });
  }
  return points;
}

const POINT_CLOUD = generateDeterministicPoints(140, 42);

export default function LidarPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const CYCLE_MS = 8000;

    function draw(timestamp: number) {
      if (!ctx) return;
      const progress = (timestamp % CYCLE_MS) / CYCLE_MS;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = "#0F0F17";
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(28, 28, 42, 0.5)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Hull outline
      ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(W * 0.1, H * 0.35);
      ctx.lineTo(W * 0.15, H * 0.25);
      ctx.lineTo(W * 0.85, H * 0.25);
      ctx.lineTo(W * 0.9, H * 0.35);
      ctx.lineTo(W * 0.9, H * 0.65);
      ctx.lineTo(W * 0.85, H * 0.75);
      ctx.lineTo(W * 0.15, H * 0.75);
      ctx.lineTo(W * 0.1, H * 0.65);
      ctx.closePath();
      ctx.stroke();

      // Waterline
      ctx.strokeStyle = "rgba(99, 102, 241, 0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W * 0.08, H * 0.5);
      ctx.lineTo(W * 0.92, H * 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point cloud
      POINT_CLOUD.forEach((pt) => {
        const px = pt.x * W;
        const py = pt.y * H;
        const distFromSweep = Math.abs(px / W - progress);
        const alpha = distFromSweep < 0.05 ? 0.9 : 0.25;
        ctx.fillStyle = `rgba(129, 140, 248, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Sweep bar
      const sweepX = progress * W;
      const gradient = ctx.createLinearGradient(sweepX - 60, 0, sweepX, 0);
      gradient.addColorStop(0, "rgba(99, 102, 241, 0)");
      gradient.addColorStop(1, "rgba(99, 102, 241, 0.4)");
      ctx.fillStyle = gradient;
      ctx.fillRect(sweepX - 60, 0, 60, H);

      ctx.strokeStyle = "rgba(129, 140, 248, 0.8)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sweepX, 0);
      ctx.lineTo(sweepX, H);
      ctx.stroke();

      // Station markers
      STATION_MARKERS.forEach((marker, i) => {
        const mx = marker.x * W;
        const my = marker.y * H;
        const staggerPhase = ((timestamp + i * 400) % 2000) / 2000;
        const pulseAlpha = 0.4 + 0.6 * Math.abs(Math.sin(staggerPhase * Math.PI));

        // Marker dot
        ctx.fillStyle = `rgba(129, 140, 248, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();

        // Marker ring
        ctx.strokeStyle = `rgba(129, 140, 248, ${pulseAlpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = `rgba(180, 180, 197, ${pulseAlpha})`;
        ctx.font = "10px monospace";
        ctx.textAlign = "center";
        ctx.fillText(marker.id, mx, my - 16);
      });

      // Coordinate label
      ctx.fillStyle = "rgba(122, 122, 140, 0.8)";
      ctx.font = "10px monospace";
      ctx.textAlign = "right";
      ctx.fillText("29.9010°N · 90.2140°W", W - 12, H - 12);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, []);

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
          LiDAR AUTONOMOUS DRAFT SURVEY
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
          LiDAR Scanning Process
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
          Raw sensory input of the FREQ AI scanning process. The LiDAR
          sweep traverses the hull in a continuous 8-second cycle,
          capturing a 140-point deterministic cloud across six draft
          stations.
        </p>

        {/* LiDAR Canvas */}
        <div
          style={{
            aspectRatio: "720/320",
            width: "100%",
            maxWidth: 900,
            background: "var(--dark-matter-raised)",
            border: "1px solid var(--dark-matter-border)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            marginBottom: 48,
          }}
          aria-label="LiDAR autonomous draft survey visualization. An indigo sweep bar traverses the hull left-to-right over 8 seconds. 140 data points scatter across the hull. Six draft station markers (FP, FS, MP, MS, AP, AS) pulse in a staggered sequence. Coordinates: 29.9010°N, 90.2140°W."
          role="img"
        >
          <canvas
            ref={canvasRef}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
            }}
          />
        </div>

        {/* Station Details */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 48,
          }}
        >
          {STATION_MARKERS.map((station) => (
            <div
              key={station.id}
              style={{
                padding: 16,
                background: "var(--dark-matter-raised)",
                border: "1px solid var(--dark-matter-border)",
                borderRadius: "var(--radius-md)",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "var(--text-lg)",
                  color: "var(--indigo-400)",
                  fontWeight: 500,
                  display: "block",
                  marginBottom: 4,
                }}
              >
                {station.id}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-jetbrains-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--white-dim)",
                }}
              >
                DRAFT STATION
              </span>
            </div>
          ))}
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
              SWEEP CYCLE
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
              The LiDAR sweep bar traverses the hull left-to-right in a
              continuous 8-second cycle. Each pass captures point cloud
              data across all six draft stations.
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
              POINT CLOUD
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
              140 deterministic data points scatter across the hull
              surface. Points illuminate as the sweep bar passes,
              providing real-time visual feedback of the scanning
              coverage.
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
              DRAFT ACCURACY
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
              LiDAR-measured waterline delta of ±0.02 ft. Calibrated
              across six stations (FP, FS, MP, MS, AP, AS) with a mean
              draft of 12.45 ft.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
