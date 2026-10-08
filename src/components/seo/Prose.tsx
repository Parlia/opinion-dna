import Link from "next/link";
import type { ReactNode } from "react";
import type { SimpleTable } from "@/data/seo/content-types";

// Renders the tiny markup documented in src/data/seo/content-types.ts.
// Output is React elements only (no raw HTML), so data strings can't inject markup.

const LINK_RE = /\[([^\]]+)\]\(((?:\/|https?:\/\/)[^)\s]*)\)/g;

/** Plain-text version of a prose string, for meta tags and JSON-LD. */
export function stripProse(text: string): string {
  return text
    .replace(LINK_RE, "$1")
    .replace(/^### /gm, "")
    .replace(/^- /gm, "")
    .replace(/\n{2,}/g, " ")
    .replace(/\n/g, " ")
    .trim();
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(LINK_RE)) {
    const [whole, label, href] = m;
    const start = m.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const key = `${keyPrefix}-l${i++}`;
    out.push(
      href.startsWith("/") ? (
        <Link key={key} href={href} className="text-primary hover:underline">
          {label}
        </Link>
      ) : (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {label}
        </a>
      )
    );
    last = start + whole.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function Prose({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`space-y-4 ${className}`}>
      {blocks.map((block, bi) => {
        const key = `b${bi}`;
        if (block.startsWith("### ")) {
          return (
            <h3 key={key} className="text-xl text-black pt-2">
              {inline(block.slice(4), key)}
            </h3>
          );
        }
        const lines = block.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={key} className="space-y-2">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-3 text-foreground leading-relaxed">
                  <span className="text-primary flex-shrink-0">&bull;</span>
                  <span>{inline(l.slice(2), `${key}-${li}`)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={key} className="text-foreground leading-relaxed">
            {inline(lines.join(" "), key)}
          </p>
        );
      })}
    </div>
  );
}

/** Generic data table for long-form sections and multi-way comparisons. */
export function DataTable({ table }: { table: SimpleTable }) {
  const hl = table.highlightColumn;
  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              {table.columns.map((c, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`text-left py-3 px-4 text-sm font-semibold ${
                    i === hl ? "text-primary" : i === 0 ? "text-muted" : "text-foreground"
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-border align-top">
                {row.map((cell, ci) =>
                  ci === 0 ? (
                    <th
                      key={ci}
                      scope="row"
                      className="text-left py-3 px-4 text-sm font-medium text-foreground"
                    >
                      {cell}
                    </th>
                  ) : (
                    <td
                      key={ci}
                      className={`py-3 px-4 text-sm ${
                        ci === hl ? "text-foreground" : "text-muted"
                      }`}
                    >
                      {cell}
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note && <Prose text={table.note} className="mt-3 text-xs [&_p]:text-muted [&_p]:text-xs" />}
    </div>
  );
}
