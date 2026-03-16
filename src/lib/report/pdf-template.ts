/**
 * PDF HTML Template Builder
 *
 * Generates a complete, self-contained HTML document from a report's
 * markdown content and scores array. All CSS is inlined so Puppeteer
 * can render it via page.setContent() without any network requests.
 */

import { Marked, type Tokens } from "marked";
import { ELEMENTS, PARLIA_AVERAGES } from "@/lib/scoring/elements";
import { getScoreLevel } from "@/lib/scoring/engine";

// ── Section styling (mirrors report/page.tsx) ──

const SECTION_STYLES: Record<string, { accent: string; bg: string; icon: string }> = {
  "How to Read": { accent: "#888", bg: "#F9F8F6", icon: "&#128214;" },
  "Part 1":      { accent: "#6F00FF", bg: "#FAF8FF", icon: "&#129516;" },
  "Part 2":      { accent: "#00A86B", bg: "#F4FBF7", icon: "&#127807;" },
  "Part 3":      { accent: "#9B4DFF", bg: "#FAF5FF", icon: "&#128172;" },
  "Part 4":      { accent: "#0066CC", bg: "#F0F7FF", icon: "&#128640;" },
  "Part 5":      { accent: "#E67E22", bg: "#FFF8F0", icon: "&#129504;" },
  "Part 6":      { accent: "#555",    bg: "#F9F8F6", icon: "&#128203;" },
  "What Now":    { accent: "#6F00FF", bg: "#FAF8FF", icon: "&#127919;" },
};

function getSectionStyle(title: string) {
  for (const [key, style] of Object.entries(SECTION_STYLES)) {
    if (title.includes(key)) return style;
  }
  return { accent: "#6F00FF", bg: "#FFFFFF", icon: "&#128196;" };
}

const LEVEL_COLORS: Record<string, string> = {
  "VERY HIGH": "#6F00FF",
  HIGH: "#9B4DFF",
  MEDIUM: "#B8860B",
  LOW: "#D2691E",
  "VERY LOW": "#CC3333",
};

// ── Score bar colour gradient (mirrors report/page.tsx) ──

const DIM_COLORS: Record<string, { low: number[]; high: number[] }> = {
  personality:     { low: [0, 239, 148], high: [0, 120, 30] },
  values:          { low: [0, 206, 255], high: [0, 64, 204] },
  "meta-thinking": { low: [255, 0, 247], high: [107, 0, 204] },
};

function scoreColor(dimension: string, score: number): string {
  const range = DIM_COLORS[dimension] || DIM_COLORS.personality;
  const t = score / 100;
  const r = Math.round(range.low[0] + (range.high[0] - range.low[0]) * t);
  const g = Math.round(range.low[1] + (range.high[1] - range.low[1]) * t);
  const b = Math.round(range.low[2] + (range.high[2] - range.low[2]) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

// ── Markdown parsing (mirrors report/page.tsx) ──

function parseSections(content: string) {
  const sections: { title: string; body: string }[] = [];
  const lines = content.split("\n");
  let currentTitle = "";
  let currentBody: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentTitle || currentBody.length > 0) {
        sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
      }
      currentTitle = line.replace("## ", "").trim();
      currentBody = [];
    } else if (line === "---") {
      continue;
    } else {
      currentBody.push(line);
    }
  }
  if (currentTitle || currentBody.length > 0) {
    sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
  }
  return sections;
}

// ── Callout detection (mirrors report/page.tsx) ──

type BlockType = "markdown" | "superpower" | "watchout" | "tip";

function parseCallouts(content: string): { type: BlockType; content: string }[] {
  const blocks: { type: BlockType; content: string }[] = [];
  const lines = content.split("\n");
  let currentBlock: string[] = [];
  let currentType: BlockType = "markdown";

  function flush() {
    if (currentBlock.length > 0) {
      blocks.push({ type: currentType, content: currentBlock.join("\n").trim() });
      currentBlock = [];
    }
  }

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("### super power") || lower.includes("**super power") || (lower.startsWith("### ") && lower.includes("super"))) {
      flush(); currentType = "superpower"; currentBlock.push(line);
    } else if (lower.includes("### watch out") || lower.includes("**watch out") || (lower.startsWith("### ") && lower.includes("watch"))) {
      flush(); currentType = "watchout"; currentBlock.push(line);
    } else if (lower.includes("### tip") || lower.includes("**tip") || (lower.startsWith("### ") && lower.includes("tip"))) {
      flush(); currentType = "tip"; currentBlock.push(line);
    } else if (line.startsWith("### ") && currentType !== "markdown") {
      flush(); currentType = "markdown"; currentBlock.push(line);
    } else {
      currentBlock.push(line);
    }
  }
  flush();
  return blocks;
}

const CALLOUT_STYLES: Record<string, { bg: string; border: string; label: string; labelColor: string; icon: string }> = {
  superpower: { bg: "#ECFDF5", border: "#A7F3D0", label: "Super Powers", labelColor: "#047857", icon: "&#9889;" },
  watchout:   { bg: "#FFFBEB", border: "#FDE68A", label: "Watch Outs",   labelColor: "#B45309", icon: "&#9888;&#65039;" },
  tip:        { bg: "#EFF6FF", border: "#BFDBFE", label: "Tips",         labelColor: "#1D4ED8", icon: "&#128161;" },
};

// ── Markdown → HTML with level-colored bold ──

function renderMarkdown(md: string): string {
  const instance = new Marked({
    renderer: {
      strong(token: Tokens.Strong) {
        const levelColor = LEVEL_COLORS[token.text];
        if (levelColor) {
          return `<strong style="color: ${levelColor}; font-weight: 700;">${token.text}</strong>`;
        }
        return `<strong style="font-weight: 700; color: #111;">${token.text}</strong>`;
      },

      em(token: Tokens.Em) {
        return `<em style="color: #666; font-style: normal;">${token.text}</em>`;
      },

      table(token: Tokens.Table) {
        let headerHtml = "<tr>";
        for (const cell of token.header) {
          headerHtml += `<th style="padding:8px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;">${cell.text}</th>`;
        }
        headerHtml += "</tr>";

        let bodyHtml = "";
        for (const row of token.rows) {
          bodyHtml += "<tr>";
          for (const cell of row) {
            const levelColor = LEVEL_COLORS[cell.text];
            const style = `padding:8px 12px;border-bottom:1px solid #D5D0C6;${levelColor ? `color:${levelColor};font-weight:700;` : ""}`;
            bodyHtml += `<td style="${style}">${cell.text}</td>`;
          }
          bodyHtml += "</tr>";
        }

        return `<table style="width:100%;text-align:left;border-collapse:collapse;border:1px solid #D5D0C6;border-radius:8px;overflow:hidden;font-size:13px;margin:16px 0;"><thead style="background:#222;color:#fff;">${headerHtml}</thead><tbody>${bodyHtml}</tbody></table>`;
      },

      heading(token: Tokens.Heading) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = (this as any).parser.parseInline(token.tokens);
        if (token.depth === 1) return `<h1 style="font-size:24px;font-weight:700;color:#000;margin:0 0 8px;">${text}</h1>`;
        if (token.depth === 2) return `<h2 style="font-size:18px;font-weight:700;color:#000;margin:28px 0 12px;padding-bottom:8px;border-bottom:2px solid #6F00FF;">${text}</h2>`;
        return `<h3 style="font-size:14px;font-weight:700;color:#222;margin:18px 0 8px;">${text}</h3>`;
      },

      paragraph(token: Tokens.Paragraph) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const text = (this as any).parser.parseInline(token.tokens);
        return `<p style="color:#333;line-height:1.7;margin-bottom:14px;font-size:14px;">${text}</p>`;
      },

      list(token: Tokens.List) {
        const tag = token.ordered ? "ol" : "ul";
        let itemsHtml = "";
        for (const item of token.items) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const text = (this as any).parser.parseInline(item.tokens);
          itemsHtml += `<li style="margin-bottom:4px;">${text}</li>`;
        }
        return `<${tag} style="margin-left:20px;margin-bottom:14px;color:#333;font-size:14px;line-height:1.7;">${itemsHtml}</${tag}>`;
      },

      hr() {
        return `<hr style="border:none;border-top:1px solid #D5D0C6;margin:20px 0;" />`;
      },
    },
  });

  return instance.parse(md, { async: false }) as string;
}

// ── Score bars HTML (mirrors ScoreBarsSection) ──

function renderScoreBars(scores: number[]): string {
  const dimensions = [
    {
      label: "Personality",
      description: "Your biological bedrock — deeply embedded, remarkably stable over a lifetime",
      dimKey: "personality" as const,
      categories: [
        { label: "The Big 5", indices: [0, 1, 2, 3, 4] },
        { label: "The Dark Triad", indices: [5, 6, 7] },
        { label: "Emotional Regulation, Mortality & Life Satisfaction", indices: [8, 9, 10, 11] },
      ],
    },
    {
      label: "Values",
      description: "Beliefs animated by emotion — stable but shaped by culture and experience",
      dimKey: "values" as const,
      categories: [
        { label: "Moral Foundations", indices: [12, 13, 14, 15, 16] },
        { label: "Cooperative Virtues", indices: [17, 18, 19, 20, 21, 22, 23] },
        { label: "Personal Values", indices: [24, 25, 26, 27, 28, 29, 30, 31, 32, 33] },
        { label: "Social Orientation", indices: [34, 35] },
      ],
    },
    {
      label: "Meta-Thinking",
      description: "How your mind works — where it rests, what it tends toward",
      dimKey: "meta-thinking" as const,
      categories: [
        { label: "Meta-Thinking", indices: [36, 37, 38, 39, 40, 41, 42, 43] },
        { label: "Primal World Beliefs", indices: [44, 45, 46, 47] },
      ],
    },
  ];

  let html = "";

  for (const dim of dimensions) {
    html += `<div style="margin-bottom:28px;">`;
    html += `<h3 style="font-size:16px;font-weight:700;color:#222;margin-bottom:4px;">${dim.label}</h3>`;
    html += `<p style="font-size:12px;color:#888;margin-bottom:14px;">${dim.description}</p>`;

    for (const cat of dim.categories) {
      html += `<div style="background:#fff;border-radius:12px;border:1px solid #E8E4DC;overflow:hidden;margin-bottom:14px;">`;
      html += `<div style="padding:8px 14px;background:#F7F4EE;border-bottom:1px solid #E8E4DC;"><span style="font-size:10px;font-weight:500;color:#888;text-transform:uppercase;letter-spacing:0.05em;">${cat.label}</span></div>`;

      for (let i = 0; i < cat.indices.length; i++) {
        const idx = cat.indices[i];
        const el = ELEMENTS[idx];
        const score = scores[idx] ?? 0;
        const avg = PARLIA_AVERAGES[idx];
        const level = getScoreLevel(score);
        const color = scoreColor(dim.dimKey, score);
        const levelColor = LEVEL_COLORS[level] || "#888";
        const borderBottom = i < cat.indices.length - 1 ? "border-bottom:1px solid #F0ECE4;" : "";

        html += `<div style="padding:10px 14px;${borderBottom}">`;
        html += `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">`;
        // Left: code badge + name
        html += `<div style="display:flex;align-items:center;gap:8px;">`;
        html += `<span style="width:24px;height:24px;border-radius:5px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;background:${color};">${el.code}</span>`;
        html += `<span style="font-size:13px;font-weight:500;color:#222;">${el.name}</span>`;
        html += `</div>`;
        // Right: avg + score + level
        html += `<div style="display:flex;align-items:center;gap:10px;">`;
        if (avg !== null) {
          html += `<span style="font-size:11px;color:#aaa;">avg ${avg}</span>`;
        }
        html += `<span style="font-size:15px;font-weight:700;color:#222;width:28px;text-align:right;">${score}</span>`;
        html += `<span style="font-size:9px;font-weight:700;color:${levelColor};width:52px;text-align:right;">${level}</span>`;
        html += `</div>`;
        html += `</div>`;
        // Bar
        html += `<div style="position:relative;height:7px;background:#F0ECE4;border-radius:4px;overflow:hidden;">`;
        html += `<div style="height:100%;border-radius:4px;width:${score}%;background:${color};"></div>`;
        if (avg !== null) {
          html += `<div style="position:absolute;top:0;left:${avg}%;height:100%;width:2px;background:#222;opacity:0.2;"></div>`;
        }
        html += `</div>`;
        html += `</div>`;
      }

      html += `</div>`; // category card
    }

    html += `</div>`; // dimension group
  }

  return html;
}

// ── Callout block HTML ──

function renderCalloutBlock(block: { type: BlockType; content: string }): string {
  if (block.type === "markdown") {
    return renderMarkdown(block.content);
  }

  const style = CALLOUT_STYLES[block.type];
  return `
    <div style="background:${style.bg};border:1px solid ${style.border};border-radius:12px;padding:18px;margin:20px 0;page-break-inside:avoid;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;color:${style.labelColor};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;">
        <span>${style.icon}</span> ${style.label}
      </div>
      ${renderMarkdown(block.content)}
    </div>
  `;
}

// ── Main template builder ──

export function buildPdfHtml(content: string, scores: number[]): string {
  const sections = parseSections(content);

  let sectionsHtml = "";

  for (let idx = 0; idx < sections.length; idx++) {
    const section = sections[idx];
    const style = getSectionStyle(section.title);
    const isPart1 = section.title.includes("Part 1");

    // Intro section (before any ## heading)
    if (!section.title && idx === 0) {
      sectionsHtml += `
        <div style="background:#fff;border-radius:14px;border:1px solid #E8E4DC;padding:28px;text-align:center;margin-bottom:20px;page-break-inside:avoid;">
          ${renderMarkdown(section.body)}
        </div>
      `;
      continue;
    }

    // Major parts get a page break before them
    const pageBreak = (section.title.includes("Part") || section.title.includes("What Now"))
      ? "page-break-before:always;"
      : "";

    sectionsHtml += `
      <div style="${pageBreak}background:${style.bg};border-radius:14px;border:1px solid #E8E4DC;overflow:hidden;margin-bottom:20px;">
        <div style="padding:14px 24px;border-bottom:3px solid ${style.accent};display:flex;align-items:center;gap:10px;">
          <span style="font-size:18px;">${style.icon}</span>
          <h2 style="font-size:16px;font-weight:700;color:#222;margin:0;">${section.title}</h2>
        </div>
        <div style="padding:20px 24px;">
          ${isPart1 && scores.length >= 48
            ? renderScoreBars(scores)
            : parseCallouts(section.body).map(renderCalloutBlock).join("")
          }
        </div>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  @page {
    size: A4;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html {
    background: #F1ECE2;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    color: #222;
    background: #F1ECE2;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    line-height: 1.6;
  }
  table { page-break-inside: avoid; }
  h1, h2, h3 { page-break-after: avoid; }
  ul, ol { list-style-position: outside; }

  /* Cover page */
  .cover {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    text-align: center;
    page-break-after: always;
    background: linear-gradient(180deg, #FAF8FF 0%, #F1ECE2 100%);
    padding: 60px 40px;
  }
  .cover-logo {
    font-size: 42px;
    font-weight: 300;
    color: #222;
    letter-spacing: -1px;
    margin-bottom: 12px;
  }
  .cover-logo .accent { color: #6F00FF; font-weight: 600; }
  .cover-title {
    font-size: 26px;
    font-weight: 600;
    color: #222;
    margin: 40px 0 16px;
    line-height: 1.3;
  }
  .cover-subtitle {
    font-size: 15px;
    color: #666;
    max-width: 360px;
    line-height: 1.5;
  }
  .cover-divider {
    width: 60px;
    height: 3px;
    background: #6F00FF;
    border-radius: 2px;
    margin: 32px 0;
  }
  .cover-dimensions {
    display: flex;
    gap: 32px;
    margin-top: 48px;
  }
  .cover-dim {
    text-align: center;
  }
  .cover-dim-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-bottom: 6px;
  }
  .cover-dim-label {
    font-size: 12px;
    font-weight: 600;
    color: #444;
    display: block;
  }
  .cover-dim-count {
    font-size: 11px;
    color: #999;
  }
  .cover-footer {
    margin-top: auto;
    padding-top: 60px;
    font-size: 12px;
    color: #aaa;
  }
</style>
</head>
<body>

<!-- Cover page -->
<div class="cover">
  <div class="cover-logo">Opinion <span class="accent">DNA</span></div>
  <div class="cover-divider"></div>
  <h1 class="cover-title">Your Opinion DNA Report</h1>
  <p class="cover-subtitle">A personalized analysis of your psychological profile across 48 dimensions of Personality, Values, and Meta-Thinking.</p>
  <div class="cover-dimensions">
    <div class="cover-dim">
      <span class="cover-dim-dot" style="background:#00C839;"></span>
      <span class="cover-dim-label">Personality</span>
      <span class="cover-dim-count">12 elements</span>
    </div>
    <div class="cover-dim">
      <span class="cover-dim-dot" style="background:#0082FF;"></span>
      <span class="cover-dim-label">Values</span>
      <span class="cover-dim-count">24 elements</span>
    </div>
    <div class="cover-dim">
      <span class="cover-dim-dot" style="background:#A000FF;"></span>
      <span class="cover-dim-label">Meta-Thinking</span>
      <span class="cover-dim-count">12 elements</span>
    </div>
  </div>
  <div class="cover-footer">opiniondna.com</div>
</div>

<!-- Report sections -->
<div style="padding: 14mm 18mm 10mm 18mm;">
${sectionsHtml}
</div>

</body>
</html>`;
}
