const ALLOWED_DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);

const normalizeDifficulty = (value) => {
  const raw = String(value || "Medium").trim().toLowerCase();
  const titleCased = raw.charAt(0).toUpperCase() + raw.slice(1);
  return ALLOWED_DIFFICULTIES.has(titleCased) ? titleCased : "Medium";
};

/**
 * Parses Gemini's flashcard response into a validated array of
 * { question, answer, difficulty } objects. Tolerates markdown code
 * fences and stray commentary around the JSON array.
 */
export const parseFlashcardsJson = (rawText) => {
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

  const flashcards = parsed
    .map((item) => ({
      question: String(item?.question || "").trim(),
      answer: String(item?.answer || "").trim(),
      difficulty: normalizeDifficulty(item?.difficulty),
    }))
    .filter((card) => card.question && card.answer);

  if (flashcards.length === 0) {
    const error = new Error(
      "The AI didn't return any usable flashcards. Please try again."
    );
    error.statusCode = 502;
    throw error;
  }

  return flashcards;
};
