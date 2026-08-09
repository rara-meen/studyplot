import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import { generateText } from "./geminiService.js";
import { parseQuizJson } from "../utils/quizParser.js";

const MAX_CONTENT_CHARS = 40000;

const QUIZ_PROMPT = (content, difficulty) => `You are an expert university professor.

Generate a multiple-choice quiz based ONLY on the uploaded document.

Requirements

Generate exactly 10 questions at a "${difficulty}" difficulty level.

Each question must contain

Question

4 answer options

Correct answer

Short explanation

Difficulty

(Easy, Medium, Hard)

Do not invent information.

Return JSON only.

Return a JSON array of exactly 10 objects. Each object must have exactly these keys: "question" (string), "options" (an array of exactly 4 strings), "correctAnswer" (string that exactly matches one of the 4 options), "explanation" (string), and "difficulty" (one of "Easy", "Medium", "Hard"). Do not include markdown code fences, explanations outside the JSON, or any text outside the JSON array.

Document:
"""
${content}
"""`;

export const normalizeDifficultyInput = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (["easy", "medium", "hard"].includes(raw)) {
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return null;
};

export const getCachedQuiz = (documentId, difficulty, userId) =>
  Quiz.findOne({ documentId, difficulty, userId });

export const getAllQuizzesForDocument = (documentId, userId) =>
  Quiz.find({ documentId, userId }).sort({ difficulty: 1 });

export const generateDocumentQuiz = async (
  documentId,
  difficulty,
  userId,
  { regenerate = false } = {}
) => {
  const document = await Document.findOne({ _id: documentId, userId });

  if (!document) {
    const error = new Error("Document not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!document.extractedText || !document.extractedText.trim()) {
    const error = new Error(
      "This document doesn't have any extracted text to generate a quiz from. Try re-uploading the PDF."
    );
    error.statusCode = 422;
    throw error;
  }

  if (!regenerate) {
    const existing = await getCachedQuiz(documentId, difficulty, userId);
    if (existing && existing.questions.length > 0) {
      return { quiz: existing, cached: true };
    }
  }

  const content = document.extractedText.slice(0, MAX_CONTENT_CHARS);
  const rawResponse = await generateText(QUIZ_PROMPT(content, difficulty));
  const questions = parseQuizJson(rawResponse, difficulty);

  let quiz;
  try {
    quiz = await Quiz.findOneAndUpdate(
      { documentId, difficulty, userId },
      { $set: { userId, documentId, difficulty, questions } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (dbError) {
    const error = new Error(
      "The quiz was generated but couldn't be saved. Please try again."
    );
    error.statusCode = 500;
    throw error;
  }

  return { quiz, cached: false };
};

export const deleteDocumentQuiz = async (documentId, difficulty, userId) => {
  if (difficulty) {
    const result = await Quiz.deleteOne({ documentId, difficulty, userId });
    return result.deletedCount;
  }
  const result = await Quiz.deleteMany({ documentId, userId });
  return result.deletedCount;
};

export const recordQuizScore = async (documentId, difficulty, userId, scoreEntry) => {
  const quiz = await Quiz.findOne({ documentId, difficulty, userId });

  if (!quiz) {
    const error = new Error(
      "Quiz not found for this document and difficulty."
    );
    error.statusCode = 404;
    throw error;
  }

  quiz.scoreHistory.push(scoreEntry);
  await quiz.save();

  return quiz;
};
