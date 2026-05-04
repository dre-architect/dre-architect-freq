export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--dark-matter-border)",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-space-grotesk)",
          fontSize: "var(--text-sm)",
          color: "var(--white-dim)",
          margin: 0,
        }}
      >
        FREQ AI — ADM Waggaman Terminal, Mississippi River
      </p>
      <p
        style={{
          fontFamily: "var(--font-jetbrains-mono)",
          fontSize: "var(--text-xs)",
          color: "var(--white-dim)",
          margin: 0,
        }}
      >
        29.9010°N · 90.2140°W
      </p>
    </footer>
  );
}
