"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/digital-twin", label: "Digital Twin" },
  { href: "/barge-crane", label: "Barge & Crane" },
  { href: "/cargo-system", label: "Cargo System" },
  { href: "/lidar", label: "LiDAR" },
  { href: "/simulation-grounds", label: "Simulation Grounds" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        background: "rgba(7, 7, 12, 0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--dark-matter-border)",
      }}
    >
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-space-grotesk)",
          fontSize: "var(--text-lg)",
          fontWeight: 600,
          color: "var(--white)",
          textDecoration: "none",
          letterSpacing: "-0.02em",
        }}
      >
        FREQ<span style={{ color: "var(--indigo-500)" }}>.</span>AI
      </Link>

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          overflowX: "auto",
        }}
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                fontFamily: "var(--font-ibm-plex-sans)",
                fontSize: "var(--text-sm)",
                fontWeight: 500,
                color: isActive
                  ? "var(--indigo-400)"
                  : "var(--white-dim)",
                textDecoration: "none",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                background: isActive
                  ? "rgba(99, 102, 241, 0.1)"
                  : "transparent",
                whiteSpace: "nowrap",
                transition: "color 0.15s ease, background 0.15s ease",
                minHeight: 44,
                display: "flex",
                alignItems: "center",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--white-muted)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = "var(--white-dim)";
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
