import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "Opinion DNA — 48 dimensions of personality, values, and meta-thinking";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "linear-gradient(135deg, #F5F0E8 0%, #EDE7DB 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          <span
            style={{
              fontSize: "48px",
              fontWeight: 400,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
            }}
          >
            Opinion
          </span>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 400,
              color: "#7c3aed",
              letterSpacing: "-0.02em",
            }}
          >
            DNA
          </span>
          <span
            style={{
              fontSize: "24px",
              color: "#7c3aed",
              position: "relative",
              top: "-16px",
            }}
          >
            ®
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#1a1a1a",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.2,
            marginBottom: "24px",
          }}
        >
          The most complete map of your mind
        </div>

        {/* Dimensions */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "8px",
          }}
        >
          {[
            { label: "Personality", color: "#00A86B" },
            { label: "Values", color: "#0066CC" },
            { label: "Meta-Thinking", color: "#9B4DFF" },
          ].map((dim) => (
            <div
              key={dim.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: dim.color,
                }}
              />
              <span
                style={{
                  fontSize: "20px",
                  color: "#666",
                }}
              >
                {dim.label}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom stat */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            display: "flex",
            gap: "32px",
            color: "#999",
            fontSize: "18px",
          }}
        >
          <span>48 dimensions</span>
          <span>·</span>
          <span>60+ world experts</span>
          <span>·</span>
          <span>10-15 minutes</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
