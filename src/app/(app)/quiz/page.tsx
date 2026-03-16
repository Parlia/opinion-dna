"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { QUESTIONS } from "@/lib/scoring/questions";

const ANSWER_LABELS = [
  "Strongly Agree",
  "Agree",
  "Neutral",
  "Disagree",
  "Strongly Disagree",
];

// Map display index to answer value (Strongly Agree=5, Agree=4, etc.)
const ANSWER_VALUES = [5, 4, 3, 2, 1];

const ENCOURAGEMENTS: Record<number, string> = {
  10: "Great start! You're finding your rhythm.",
  25: "Nice pace! Keep going.",
  45: "Quarter of the way there!",
  60: "You're in the flow now.",
  90: "Halfway there! You're doing great.",
  120: "Two-thirds done — the finish line is in sight.",
  135: "Almost there! Just a few more to go.",
  150: "The home stretch! You've got this.",
  170: "So close — just a handful left!",
};

export default function QuizPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);
  const [clickedValue, setClickedValue] = useState<number | null>(null);
  const router = useRouter();

  // Load saved progress
  useEffect(() => {
    async function loadProgress() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: responses } = await supabase
        .from("quiz_responses")
        .select("question_index, answer")
        .eq("user_id", user.id);

      if (responses && responses.length > 0) {
        const savedAnswers = new Map<number, number>();
        let maxIndex = 0;
        for (const r of responses) {
          savedAnswers.set(r.question_index, r.answer);
          if (r.question_index > maxIndex) maxIndex = r.question_index;
        }
        setAnswers(savedAnswers);
        // Resume from first unanswered question
        const firstUnanswered = QUESTIONS.findIndex((_, i) => !savedAnswers.has(i));
        setCurrentIndex(firstUnanswered === -1 ? QUESTIONS.length - 1 : firstUnanswered);
      }
      setLoading(false);
    }
    loadProgress();
  }, []);

  const saveAnswer = useCallback(async (questionIndex: number, answer: number) => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("quiz_responses")
      .upsert(
        { user_id: user.id, question_index: questionIndex, answer },
        { onConflict: "user_id,question_index" }
      );
    setSaving(false);
  }, []);

  function handleAnswer(answer: number) {
    const newAnswers = new Map(answers);
    newAnswers.set(currentIndex, answer);
    setAnswers(newAnswers);
    saveAnswer(currentIndex, answer);
    setClickedValue(answer);

    // Check for encouragement message
    const nextCount = newAnswers.size;
    if (ENCOURAGEMENTS[nextCount]) {
      setEncouragement(ENCOURAGEMENTS[nextCount]);
      setTimeout(() => setEncouragement(null), 4000);
    }

    // Animate out, advance, animate in
    setTimeout(() => {
      setClickedValue(null);
      if (currentIndex < QUESTIONS.length - 1) {
        setTransitioning(true);
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setTransitioning(false);
        }, 200);
      }
    }, 350);
  }

  async function handleSubmit() {
    if (answers.size < QUESTIONS.length) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.fromEntries(answers),
        }),
      });

      if (response.ok) {
        router.push("/scores");
      }
    } catch {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-[var(--muted)]">Loading your quiz...</div>
      </div>
    );
  }

  const question = QUESTIONS[currentIndex];
  const currentAnswer = answers.get(currentIndex);
  const progress = answers.size / QUESTIONS.length;
  const isComplete = answers.size >= QUESTIONS.length;

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Progress bar */}
      <div className="bg-white border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--muted)]">
              Question {currentIndex + 1} of {QUESTIONS.length}
            </span>
            <span className="text-sm font-medium text-[var(--primary)]">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--beige-dark)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Encouragement message */}
      <div className="h-12 flex items-center justify-center">
        <div
          className={`bg-[var(--primary)] text-white px-6 py-2 rounded-full shadow-sm text-sm font-medium transition-opacity duration-700 ${
            encouragement ? "opacity-100" : "opacity-0"
          }`}
        >
          {encouragement || "\u00A0"}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {isComplete ? (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                Quiz complete!
              </h2>
              <p className="mt-2 text-[var(--muted)]">
                You&apos;ve answered all {QUESTIONS.length} questions. Submit to calculate your scores.
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-6 px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Calculating scores..." : "Submit & View Scores"}
              </button>
            </div>
          ) : (
            <>
              <h2
                className={`text-xl sm:text-2xl font-medium text-center text-[var(--foreground)] leading-relaxed transition-opacity duration-200 ${
                  transitioning ? "opacity-0" : "opacity-100"
                }`}
              >
                {question.text || `Question ${currentIndex + 1}`}
              </h2>

              <div className="mt-10 grid grid-cols-5 gap-0 rounded-xl overflow-hidden border border-[var(--border)]">
                {ANSWER_LABELS.map((label, i) => {
                  const value = ANSWER_VALUES[i];
                  const isSelected = currentAnswer === value;
                  const justClicked = clickedValue === value;
                  return (
                    <button
                      key={value}
                      onClick={() => handleAnswer(value)}
                      className={`px-2 py-5 text-center border-r last:border-r-0 border-[var(--border)] transition-colors duration-150 ${
                        isSelected
                          ? "bg-[var(--primary)] text-white"
                          : "bg-[#e8f0fe] hover:bg-[#c5d8f8] text-[var(--foreground)]"
                      } ${justClicked ? "brightness-90" : ""} active:brightness-90`}
                    >
                      <span className="text-sm font-medium leading-tight">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  {saving && <span>Saving...</span>}
                </div>
                <button
                  onClick={() => setCurrentIndex(Math.min(QUESTIONS.length - 1, currentIndex + 1))}
                  disabled={currentIndex >= QUESTIONS.length - 1}
                  className="px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 transition-colors"
                >
                  Skip
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
