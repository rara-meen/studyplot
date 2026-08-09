import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateDocumentQuiz,
  getCachedQuiz,
  getAllQuizzesForDocument,
  deleteDocumentQuiz,
  recordQuizScore,
  normalizeDifficultyInput,
} from "../services/quizService.js";
import { notify } from "../services/notificationService.js";

const formatQuestion = (q) => ({
  question: q.question,
  options: q.options,
  correctAnswer: q.correctAnswer,
  explanation: q.explanation,
  difficulty: q.difficulty,
});

const formatQuiz = (quiz) => ({
  id: quiz._id,
  documentId: quiz.documentId,
  difficulty: quiz.difficulty,
  questions: quiz.questions.map(formatQuestion),
  scoreHistory: quiz.scoreHistory,
  createdAt: quiz.createdAt,
  updatedAt: quiz.updatedAt,
});

const requireValidDocumentId = (documentId) => {
  if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
    const error = new Error("Please provide a valid document ID.");
    error.statusCode = 400;
    throw error;
  }
};

const requireValidDifficulty = (difficulty) => {
  const normalized = normalizeDifficultyInput(difficulty);
  if (!normalized) {
    const error = new Error(
      "Please choose a difficulty: Easy, Medium, or Hard."
    );
    error.statusCode = 400;
    throw error;
  }
  return normalized;
};

export const generateQuiz = asyncHandler(async (req, res) => {
  const { documentId, difficulty, regenerate } = req.body;
  requireValidDocumentId(documentId);
  const normalizedDifficulty = requireValidDifficulty(difficulty);

  const { quiz, cached } = await generateDocumentQuiz(
    documentId,
    normalizedDifficulty,
    req.user.id,
    { regenerate: Boolean(regenerate) }
  );

  if (!cached) {
    notify(req.user.id, `A ${normalizedDifficulty.toLowerCase()} quiz was generated.`, "success");
  }

  res.status(200).json({
    success: true,
    cached,
    quiz: formatQuiz(quiz),
  });
});

export const getQuiz = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { difficulty } = req.query;
  requireValidDocumentId(documentId);

  if (difficulty) {
    const normalizedDifficulty = requireValidDifficulty(difficulty);
    const quiz = await getCachedQuiz(documentId, normalizedDifficulty, req.user.id);
    return res.status(200).json({
      success: true,
      found: Boolean(quiz),
      quiz: quiz ? formatQuiz(quiz) : null,
    });
  }

  const quizzes = await getAllQuizzesForDocument(documentId, req.user.id);
  res.status(200).json({
    success: true,
    count: quizzes.length,
    quizzes: quizzes.map(formatQuiz),
  });
});

export const deleteQuiz = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { difficulty } = req.query;
  requireValidDocumentId(documentId);

  const normalizedDifficulty = difficulty
    ? requireValidDifficulty(difficulty)
    : null;
  const deletedCount = await deleteDocumentQuiz(documentId, normalizedDifficulty, req.user.id);

  res.status(200).json({
    success: true,
    message: "Quiz deleted successfully.",
    deletedCount,
  });
});

export const submitQuizScore = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const { difficulty, score, totalQuestions, timeTakenSeconds } = req.body;
  requireValidDocumentId(documentId);
  const normalizedDifficulty = requireValidDifficulty(difficulty);

  const isValidScore =
    typeof score === "number" &&
    typeof totalQuestions === "number" &&
    totalQuestions > 0 &&
    score >= 0 &&
    score <= totalQuestions;

  if (!isValidScore) {
    const error = new Error(
      "Please provide a valid score and total question count."
    );
    error.statusCode = 400;
    throw error;
  }

  const percentage = Math.round((score / totalQuestions) * 100);

  const quiz = await recordQuizScore(documentId, normalizedDifficulty, req.user.id, {
    score,
    totalQuestions,
    percentage,
    timeTakenSeconds: Number(timeTakenSeconds) || 0,
  });

  res.status(200).json({
    success: true,
    scoreHistory: quiz.scoreHistory,
  });
});
