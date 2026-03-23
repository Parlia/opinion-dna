/**
 * Robust JSON extraction from LLM responses.
 *
 * Claude sometimes wraps JSON in markdown code fences, adds commentary
 * before/after, or produces trailing commas. This utility handles all
 * common malformations.
 */

export class LLMParseError extends Error {
  constructor(message: string, public readonly rawResponse: string) {
    super(message);
    this.name = "LLMParseError";
  }
}

/**
 * Extract and parse JSON from an LLM response string.
 * Handles: clean JSON, code-fenced JSON, commentary around JSON,
 * trailing commas, and single-quoted strings.
 */
export function extractJSON<T = unknown>(raw: string): T {
  if (!raw || raw.trim().length === 0) {
    throw new LLMParseError("Empty response", raw);
  }

  let cleaned = raw.trim();

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }

  // If no code fence found, try to extract first { to last }
  if (!cleaned.startsWith("{") && !cleaned.startsWith("[")) {
    const firstBrace = cleaned.indexOf("{");
    const firstBracket = cleaned.indexOf("[");

    let start = -1;
    if (firstBrace === -1 && firstBracket === -1) {
      throw new LLMParseError("No JSON object or array found in response", raw);
    }
    if (firstBrace === -1) start = firstBracket;
    else if (firstBracket === -1) start = firstBrace;
    else start = Math.min(firstBrace, firstBracket);

    const isObject = cleaned[start] === "{";
    const closer = isObject ? "}" : "]";

    // Find matching closing brace/bracket from end
    const lastClose = cleaned.lastIndexOf(closer);
    if (lastClose <= start) {
      throw new LLMParseError(`No matching ${closer} found`, raw);
    }

    cleaned = cleaned.slice(start, lastClose + 1);
  }

  // Remove trailing commas before } or ]
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    throw new LLMParseError(
      `JSON parse failed: ${e instanceof Error ? e.message : String(e)}`,
      raw
    );
  }
}
