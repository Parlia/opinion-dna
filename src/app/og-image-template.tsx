import { ImageResponse } from "next/og";

/**
 * Shared OG image template for the dynamic SEO routes (/tests, /vs, /for,
 * /alternatives, /dimensions). Same brand language as the root
 * opengraph-image.tsx (beige, gradient orb, rings, logo) but with a
 * per-page kicker + title instead of the generic tagline.
 *
 * Lives in src/app (non-route filename) so the font fetch below can use the
 * same "./fonts/..." relative URLs as the root OG image.
 */

export const OG_SIZE = { width: 1200, height: 630 };

export async function renderSeoOgImage({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  const [dmSansRegular, dmSansBold] = await Promise.all([
    fetch(new URL("./fonts/dm-sans-regular.ttf", import.meta.url)).then((r) =>
      r.arrayBuffer()
    ),
    fetch(new URL("./fonts/dm-sans-bold.ttf", import.meta.url)).then((r) =>
      r.arrayBuffer()
    ),
  ]);

  // Long titles need a smaller size to fit two lines.
  const titleSize = title.length > 55 ? "52px" : title.length > 35 ? "60px" : "72px";

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
        {/* Gradient orb — matches hero */}
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

        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "36px",
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: "36px", fontWeight: 400, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
            Opinion
          </span>
          <span style={{ fontSize: "36px", fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.02em" }}>
            DNA
          </span>
          <div style={{ display: "flex", gap: "5px", marginLeft: "4px" }}>
            {[
              ["#FF69B4", "rgba(160,80,255,0.7)"],
              ["#AAFF00", "rgba(0,210,200,0.7)"],
              ["#FF8C00", "rgba(255,50,50,0.7)"],
            ].map(([a, b], i) => (
              <div key={i} style={{ position: "relative", width: "24px", height: "24px", display: "flex" }}>
                <div style={{ position: "absolute", top: "0", left: "0", width: "18px", height: "18px", borderRadius: "50%", background: a, display: "flex" }} />
                <div style={{ position: "absolute", top: "5px", left: "6px", width: "18px", height: "18px", borderRadius: "50%", background: b, display: "flex" }} />
              </div>
            ))}
          </div>
        </div>

        {/* Kicker */}
        <div
          style={{
            display: "flex",
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: "20px",
            padding: "8px 20px",
            border: "1px solid rgba(0,0,0,0.06)",
            fontSize: "20px",
            color: "#6F00FF",
            fontWeight: 700,
            marginBottom: "24px",
            zIndex: 1,
          }}
        >
          {kicker}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            color: "#1a1a1a",
            textAlign: "center",
            maxWidth: "1000px",
            lineHeight: 1.15,
            zIndex: 1,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle ? (
          <div
            style={{
              fontSize: "26px",
              color: "#555",
              textAlign: "center",
              maxWidth: "860px",
              lineHeight: 1.35,
              marginTop: "20px",
              zIndex: 1,
            }}
          >
            {subtitle}
          </div>
        ) : null}

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
          <span>Personality · Values · Meta-Thinking</span>
          <span>·</span>
          <span style={{ color: "#6F00FF" }}>opiniondna.com</span>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "DM Sans", data: dmSansRegular, weight: 400 as const, style: "normal" as const },
        { name: "DM Sans", data: dmSansBold, weight: 700 as const, style: "normal" as const },
      ],
    }
  );
}
