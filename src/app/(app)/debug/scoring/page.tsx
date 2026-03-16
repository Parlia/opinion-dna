"use client";

import { QUESTIONS } from "@/lib/scoring/questions";
import { ELEMENTS, PARLIA_AVERAGES } from "@/lib/scoring/elements";
import { useState } from "react";
import { notFound } from "next/navigation";

const GROUP_COLORS: Record<string, string> = {
  personality: "#00B922",
  values: "#0054FF",
  "meta-thinking": "#8A00FF",
};

export default function ScoringDebugPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const [view, setView] = useState<"questions" | "simulator">("questions");
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Group questions by resultGroup
  const grouped = new Map<number, typeof QUESTIONS>();
  for (const q of QUESTIONS) {
    const arr = grouped.get(q.resultGroup) || [];
    arr.push(q);
    grouped.set(q.resultGroup, arr);
  }

  // Calculate score for a single element (returns null if incomplete)
  function calcGroupScore(rg: number): number | null {
    const questions = grouped.get(rg);
    if (!questions) return null;

    let total = 0;
    let count = 0;
    const SCALE = [4, 3, 2, 1, 0];

    for (const q of questions) {
      let rating = answers[q.index];
      if (rating === undefined) return null; // incomplete group

      if (q.direction === -1) {
        rating = 6 - rating;
      }

      total += SCALE[rating - 1];
      count++;
    }

    return Math.floor((total * 100) / 4 / count);
  }

  function fillAll(value: number) {
    const a: Record<number, number> = {};
    QUESTIONS.forEach((q) => (a[q.index] = value));
    setAnswers(a);
  }

  function fillGroup(rg: number, value: number) {
    const questions = grouped.get(rg);
    if (!questions) return;
    setAnswers((a) => {
      const updated = { ...a };
      questions.forEach((q) => (updated[q.index] = value));
      return updated;
    });
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Scoring Diagnostic</h1>
      <p className="text-sm text-gray-500 mb-6">
        {QUESTIONS.length} questions → {ELEMENTS.length} elements
      </p>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("questions")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            view === "questions"
              ? "bg-[var(--primary)] text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Question Map
        </button>
        <button
          onClick={() => setView("simulator")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            view === "simulator"
              ? "bg-[var(--primary)] text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Score Simulator
        </button>
      </div>

      {view === "questions" && (
        <div className="space-y-6">
          {Array.from(grouped.entries())
            .sort(([a], [b]) => a - b)
            .map(([rg, questions]) => {
              const element = ELEMENTS[rg - 1];
              const dim = element.dimension;
              const color = GROUP_COLORS[dim];
              return (
                <div
                  key={rg}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{ borderLeft: `4px solid ${color}` }}
                  >
                    <span
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {element.code}
                    </span>
                    <div>
                      <span className="font-semibold text-sm">
                        ResultGroup {rg}: {element.name}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {dim} / {element.category}
                      </span>
                    </div>
                    <span className="ml-auto text-xs text-gray-400">
                      {questions.length} Q{questions.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left text-xs text-gray-500">
                        <th className="px-4 py-2 w-16">Index</th>
                        <th className="px-4 py-2 w-28">UID</th>
                        <th className="px-4 py-2 w-20">Direction</th>
                        <th className="px-4 py-2">Question Text</th>
                      </tr>
                    </thead>
                    <tbody>
                      {questions.map((q) => (
                        <tr
                          key={q.index}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 font-mono text-xs">
                            {q.index}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs text-gray-400">
                            {q.uid}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                                q.direction === 1
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {q.direction === 1 ? "+1 normal" : "−1 inverted"}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-gray-700">
                            {q.text}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
        </div>
      )}

      {view === "simulator" && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-500 self-center mr-2">
              Fill all:
            </span>
            {[1, 2, 3, 4, 5].map((v) => (
              <button
                key={v}
                onClick={() => fillAll(v)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-sm font-medium hover:bg-gray-200"
              >
                All {v}s
              </button>
            ))}
            <button
              onClick={() => setAnswers({})}
              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 ml-2"
            >
              Clear
            </button>
            <span className="text-xs text-gray-400 self-center ml-2">
              {answeredCount}/{QUESTIONS.length} answered
            </span>
          </div>

          {/* Scores overview — always visible, shows per-element as they complete */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <h3 className="font-semibold text-sm mb-3">
              Calculated Scores
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {ELEMENTS.map((el, i) => {
                const rg = i + 1;
                const score = calcGroupScore(rg);
                const avg = PARLIA_AVERAGES[i];
                const color = GROUP_COLORS[el.dimension];
                const groupQs = grouped.get(rg) || [];
                const answeredInGroup = groupQs.filter(
                  (q) => answers[q.index] !== undefined
                ).length;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      score !== null ? "bg-gray-50" : "bg-gray-50/50"
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{
                        backgroundColor: color,
                        opacity: score !== null ? 1 : 0.3,
                      }}
                    >
                      {el.code}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-gray-600 truncate block">
                        {el.name}
                      </span>
                      {avg !== null && score !== null && (
                        <span className="text-[10px] text-gray-400">
                          avg: {avg} ({score > avg ? "+" : ""}
                          {score - avg})
                        </span>
                      )}
                    </div>
                    {score !== null ? (
                      <span className="text-sm font-bold shrink-0">
                        {score}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 shrink-0">
                        {answeredInGroup}/{groupQs.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-xs text-yellow-800 mb-1">
                Sanity Checks
              </h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>
                  All 1s (strongly agree): All normal-direction → 100, inverted-heavy → low
                </li>
                <li>
                  All 5s (strongly disagree): Opposite
                </li>
                <li>
                  All 3s (neutral): Every score should be 50
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            {Array.from(grouped.entries())
              .sort(([a], [b]) => a - b)
              .map(([rg, questions]) => {
                const element = ELEMENTS[rg - 1];
                const color = GROUP_COLORS[element.dimension];
                const score = calcGroupScore(rg);
                const groupAnswered = questions.filter(
                  (q) => answers[q.index] !== undefined
                ).length;
                return (
                  <div
                    key={rg}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <div
                      className="px-4 py-2 flex items-center gap-2"
                      style={{ borderLeft: `4px solid ${color}` }}
                    >
                      <span
                        className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        {element.code}
                      </span>
                      <span className="font-semibold text-sm">
                        {element.name}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({groupAnswered}/{questions.length})
                      </span>
                      {/* Fill group buttons */}
                      <div className="flex gap-1 ml-2">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            onClick={() => fillGroup(rg, v)}
                            className="w-5 h-5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 hover:bg-gray-200"
                            title={`Fill all ${element.name} questions with ${v}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                      <span className="ml-auto font-bold text-sm">
                        {score !== null ? (
                          <>Score: {score}</>
                        ) : (
                          <span className="text-gray-300 font-normal">—</span>
                        )}
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {questions.map((q) => (
                        <div
                          key={q.index}
                          className="px-4 py-2 flex items-center gap-3"
                        >
                          <span className="text-xs text-gray-400 w-8 shrink-0">
                            Q{q.index}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                              q.direction === 1
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {q.direction === 1 ? "+" : "−"}
                          </span>
                          <span className="text-sm text-gray-700 flex-1">
                            {q.text}
                          </span>
                          <div className="flex gap-1 shrink-0">
                            {[1, 2, 3, 4, 5].map((v) => (
                              <button
                                key={v}
                                onClick={() =>
                                  setAnswers((a) => ({
                                    ...a,
                                    [q.index]: v,
                                  }))
                                }
                                className={`w-7 h-7 rounded text-xs font-medium ${
                                  answers[q.index] === v
                                    ? "bg-[var(--primary)] text-white"
                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
