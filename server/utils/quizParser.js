const ALLOWED_DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

const normalizeDifficulty = (value, fallback = "Medium") => {
  const raw = String(value || fallback).trim().toLowerCase();
  const titleCased = raw.charAt(0).toUpperCase() + raw.slice(1);
  return ALLOWED_DIFFICULTIES.has(titleCased) ? titleCased : fallback;
};

/**
 * Parses Gemini's quiz response into a validated array of
 * { question, options[4], correctAnswer, explanation, difficulty } objects.
 * Tolerates markdown code fences and stray commentary around the JSON array.
 */
export const parseQuizJson = (rawText, fallbackDifficulty = "Medium") => {
  const formatError = () => {
    const error = new Error(
      "The AI returned an unexpected format. Please try regenerating."
    );
    error.statusCode = 502;
    return error;
  };

  if (!rawText || !rawText.trim()) {
    throw formatError();
  }

  let cleaned = rawText.trim();
  cleaned = cleaned
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  const jsonString = arrayMatch ? arrayMatch[0] : cleaned;

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (error) {
    throw formatError();
  }

  if (!Array.isArray(parsed)) {
    throw formatError();
  }

  const questions = parsed
    .map((item) => {
      const question = String(item?.question || "").trim();
      const rawOptions = Array.isArray(item?.options) ? item.options : [];
      const options = rawOptions
        .map((option) => String(option || "").trim())
        .filter(Boolean);
      const correctAnswer = String(item?.correctAnswer || "").trim();
      const explanation = String(item?.explanation || "").trim();
      const difficulty = normalizeDifficulty(item?.difficulty, fallbackDifficulty);

      return { question, options, correctAnswer, explanation, difficulty };
    })
    .filter(
      (q) =>
        q.question &&
        q.options.length === 4 &&
        q.correctAnswer &&
        q.options.includes(q.correctAnswer)
    );

  if (questions.length === 0) {
    const error = new Error(
      "The AI didn't return any usable quiz questions. Please try again."
    );
    error.statusCode = 502;
    throw error;
  }

  return questions;
};
