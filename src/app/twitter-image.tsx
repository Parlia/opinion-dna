import { ImageResponse } from "next/og";

// See opengraph-image.tsx — edge runtime required for the font fetch().
export const runtime = "edge";
export const alt =
  "Opinion DNA — 48 dimensions of personality, values, and meta-thinking";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  const [dmSansRegular, dmSansBold] = await Promise.all([
    fetch(new URL("./fonts/dm-sans-regular.ttf", import.meta.url)).then((r) =>
      r.arrayBuffer()
    ),
    fetch(new URL("./fonts/dm-sans-bold.ttf", import.meta.url)).then((r) =>
      r.arrayBuffer()
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          background: "#F1ECE2",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        {/* Gradient orb */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "900px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(200,170,255,0.45) 0%, rgba(130,220,255,0.3) 35%, rgba(200,240,130,0.2) 65%, transparent 100%)",
            filter: "blur(40px)",
            display: "flex",
          }}
        />

        {/* Concentric rings */}
        {[180, 240, 310, 390].map((r) => (
          <div
            key={r}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: `${r * 2}px`,
              height: `${r * 2}px`,
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,0.04)",
              display: "flex",
            }}
          />
        ))}

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "28px",
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: "56px",
              fontWeight: 400,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
            }}
          >
            Opinion
          </span>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 700,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
            }}
          >
            DNA
          </span>

          {/* Three colored dot pairs */}
          <div style={{ display: "flex", gap: "6px", marginLeft: "4px" }}>
            <div style={{ position: "relative", width: "36px", height: "36px", display: "flex" }}>
              <div style={{ position: "absolute", top: "0", left: "0", width: "28px", height: "28px", borderRadius: "50%", background: "#FF69B4", display: "flex" }} />
              <div style={{ position: "absolute", top: "6px", left: "8px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(160,80,255,0.7)", display: "flex" }} />
            </div>
            <div style={{ position: "relative", width: "36px", height: "36px", display: "flex" }}>
              <div style={{ position: "absolute", top: "0", left: "0", width: "28px", height: "28px", borderRadius: "50%", background: "#AAFF00", display: "flex" }} />
              <div style={{ position: "absolute", top: "6px", left: "8px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(0,210,200,0.7)", display: "flex" }} />
            </div>
            <div style={{ position: "relative", width: "36px", height: "36px", display: "flex" }}>
              <div style={{ position: "absolute", top: "0", left: "0", width: "28px", height: "28px", borderRadius: "50%", background: "#FF8C00", display: "flex" }} />
              <div style={{ position: "absolute", top: "6px", left: "8px", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(255,50,50,0.7)", display: "flex" }} />
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: "#1a1a1a",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.2,
            marginBottom: "28px",
            zIndex: 1,
          }}
        >
          The most complete map of your mind
        </div>

        {/* Dimension pills */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            zIndex: 1,
          }}
        >
          {[
            { label: "Personality", count: "12", color: "#00B922" },
            { label: "Values", count: "24", color: "#0054FF" },
            { label: "Meta-Thinking", count: "12", color: "#8A00FF" },
          ].map((dim) => (
            <div
              key={dim.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "20px",
                padding: "8px 18px",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "6px",
                  backgroundColor: dim.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                {dim.count}
              </div>
              <span style={{ fontSize: "18px", color: "#333", fontWeight: 500 }}>
                {dim.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            gap: "28px",
            color: "#999",
            fontSize: "16px",
            zIndex: 1,
          }}
        >
          <span>48 dimensions</span>
          <span>·</span>
          <span>60+ world experts</span>
          <span>·</span>
          <span>10–15 minutes</span>
          <span>·</span>
          <span style={{ color: "#6F00FF" }}>opiniondna.com</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "DM Sans", data: dmSansRegular, weight: 400 as const, style: "normal" as const },
        { name: "DM Sans", data: dmSansBold, weight: 700 as const, style: "normal" as const },
      ],
    }
  );
}
