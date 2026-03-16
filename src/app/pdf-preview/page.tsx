"use client";

import { useState } from "react";

// Sample scores for preview (all mid-range)
const SAMPLE_SCORES = [
  65, 45, 72, 50, 58, 30, 25, 55, 60, 35, 48, 70,
  55, 42, 50, 38, 45, 68, 72, 55, 30, 75, 50, 48,
  62, 68, 70, 80, 82, 75, 38, 50, 58, 32, 28, 40,
  25, 65, 50, 42, 60, 65, 35, 72, 75, 38, 48, 55,
];

const SAMPLE_CONTENT = `# Your Opinion DNA Report

*Generated for Preview User*

---

## How to Read This Report

This report is a personalized analysis of your psychological profile across 48 dimensions of Personality, Values, and Meta-Thinking. Each section provides insight into how your scores interact and what they mean for different areas of your life.

Scores range from 0-100. **VERY HIGH** means you score in the top quintile, **HIGH** in the second, **MEDIUM** in the middle, **LOW** in the fourth, and **VERY LOW** in the bottom quintile.

## Part 1: Your 48 Scores at a Glance

Your scores are displayed as visual bars below, grouped by dimension.

## Part 2: Life & Happiness — What Your Profile Says About Fulfilment

Your profile suggests someone who navigates life with a blend of curiosity and caution. Your **HIGH** Openness paired with **MEDIUM** Neuroticism creates an interesting dynamic — you are drawn to new experiences but remain thoughtful about potential consequences.

### Super Powers

Your combination of high Openness and strong Self-Direction gives you a natural ability to carve your own path. You are less likely to follow convention blindly and more likely to find authentic sources of satisfaction.

### Watch Outs

With **LOW** Conformity but **MEDIUM** Agreeableness, you may sometimes find yourself at odds with social expectations. This is not necessarily a weakness, but awareness of it helps navigate group dynamics.

### Tips

- Lean into your curiosity — it is genuinely one of your greatest assets
- Build routines that support exploration rather than restrict it
- Seek environments that value independent thinking

## Part 3: Relationships — How You Connect With Others

Your relationship style is characterised by genuine warmth combined with a need for intellectual stimulation. Your **MEDIUM** Agreeableness means you are neither a pushover nor combative — you seek fairness in your interactions.

Your **HIGH** Reciprocity score suggests you deeply value mutual exchange. You notice when relationships feel one-sided and this matters to you.

### Super Powers

Your blend of Fairness and Care creates a natural ability to be both compassionate and just. People likely trust you to be fair.

### Watch Outs

Your **VERY LOW** Narcissism is largely positive, but ensure you are advocating for your own needs in relationships, not just attending to others.

## Part 4: Career & Achievement — Where You Find Professional Purpose

With **HIGH** Achievement and **HIGH** Stimulation, you thrive in roles that offer both challenge and variety. Routine work without growth potential is unlikely to satisfy you.

Your **HIGH** Need for Cognition means you genuinely enjoy thinking — this is a significant professional asset in knowledge-economy roles.

### Tips

- Seek roles that combine intellectual challenge with tangible impact
- Your high Self-Direction means you work best with autonomy
- Consider entrepreneurial or creative paths that leverage your independent thinking

## Part 5: Your Cognitive Signature — How Your Mind Works

Your cognitive profile reveals a thinker who combines intellectual humility with genuine curiosity. Your **LOW** Dogmatism paired with **HIGH** Need for Cognition is a powerful combination — you enjoy thinking AND remain open to changing your mind.

Your **MEDIUM** Intellectual Humility sits in a healthy range. You are willing to acknowledge uncertainty without being paralysed by it.

## Part 6: Your 48 Elements Explained

Each of your 48 scores is detailed below with personalized interpretation.

**Openness (65 — HIGH):** Your above-average Openness means you are naturally drawn to new ideas, creative expression, and unconventional perspectives.

**Conscientiousness (45 — MEDIUM):** You maintain a moderate level of organisation. You can be disciplined when needed but do not obsess over structure.

**Extraversion (72 — HIGH):** You draw considerable energy from social interaction and tend to be comfortable in group settings.

## What Now?

Your Opinion DNA profile is a snapshot of who you are today. Personality traits are remarkably stable over a lifetime, while values shift more gradually with experience and life stage. Meta-thinking patterns can be actively developed with practice.

Use this report as a mirror, not a box. The most valuable thing about knowing your psychological profile is that it helps you make more intentional choices about how you live, work, and connect.
`;

export default function PdfPreviewPage() {
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPreview() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/report/pdf-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: SAMPLE_CONTENT,
          scores: SAMPLE_SCORES,
        }),
      });

      if (res.ok) {
        setHtml(await res.text());
      } else {
        setError("Failed to build preview: " + res.statusText);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>PDF Template Preview</h1>
      <p style={{ color: "#666", marginBottom: 16, fontSize: 14 }}>
        Renders the PDF HTML template with sample data in an iframe.
      </p>
      <button
        onClick={loadPreview}
        disabled={loading}
        style={{
          padding: "8px 20px",
          background: "#6F00FF",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 14,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
          marginBottom: 24,
        }}
      >
        {loading ? "Loading..." : "Load Preview"}
      </button>

      {error && <p style={{ color: "red", marginBottom: 16 }}>{error}</p>}

      {html && (
        <iframe
          srcDoc={html}
          style={{ width: "100%", height: "85vh", border: "1px solid #ddd", borderRadius: 12 }}
          title="PDF Preview"
        />
      )}
    </div>
  );
}
