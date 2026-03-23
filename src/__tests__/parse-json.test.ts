import { describe, it, expect } from "vitest";
import { extractJSON, LLMParseError } from "@/lib/report/parse-json";

describe("extractJSON", () => {
  it("parses clean JSON", () => {
    const result = extractJSON('{"name": "test", "value": 42}');
    expect(result).toEqual({ name: "test", value: 42 });
  });

  it("parses JSON wrapped in code fences", () => {
    const input = '```json\n{"name": "test"}\n```';
    const result = extractJSON(input);
    expect(result).toEqual({ name: "test" });
  });

  it("parses JSON wrapped in plain code fences (no language tag)", () => {
    const input = '```\n{"name": "test"}\n```';
    const result = extractJSON(input);
    expect(result).toEqual({ name: "test" });
  });

  it("extracts JSON with commentary before and after", () => {
    const input = 'Here is the analysis:\n\n{"name": "test"}\n\nI hope this helps!';
    const result = extractJSON(input);
    expect(result).toEqual({ name: "test" });
  });

  it("handles trailing commas before closing braces", () => {
    const input = '{"name": "test", "items": ["a", "b",],}';
    const result = extractJSON(input);
    expect(result).toEqual({ name: "test", items: ["a", "b"] });
  });

  it("handles trailing commas in arrays before closing bracket", () => {
    const input = '["a", "b", "c",]';
    const result = extractJSON(input);
    expect(result).toEqual(["a", "b", "c"]);
  });

  it("throws LLMParseError on empty input", () => {
    expect(() => extractJSON("")).toThrow(LLMParseError);
    expect(() => extractJSON("   ")).toThrow(LLMParseError);
  });

  it("throws LLMParseError when no JSON object found", () => {
    expect(() => extractJSON("This is just text with no JSON")).toThrow(LLMParseError);
  });

  it("throws LLMParseError on truly invalid JSON", () => {
    expect(() => extractJSON('{"name": undefined}')).toThrow(LLMParseError);
  });

  it("preserves the raw response in the error", () => {
    const raw = "Not JSON at all";
    try {
      extractJSON(raw);
    } catch (err) {
      expect(err).toBeInstanceOf(LLMParseError);
      expect((err as LLMParseError).rawResponse).toBe(raw);
    }
  });

  it("handles nested objects", () => {
    const input = '{"factors": [{"name": "test", "score": 75}], "overall": "good"}';
    const result = extractJSON<{ factors: Array<{ name: string; score: number }>; overall: string }>(input);
    expect(result.factors[0].score).toBe(75);
    expect(result.overall).toBe("good");
  });

  it("handles JSON with extra whitespace", () => {
    const input = '\n\n  {\n    "name":  "test"\n  }\n\n';
    const result = extractJSON(input);
    expect(result).toEqual({ name: "test" });
  });
});
