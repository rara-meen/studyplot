import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  generateDocumentFlashcards,
  getCachedFlashcards,
  deleteDocumentFlashcards,
} from "../services/flashcardService.js";
import { notify } from "../services/notificationService.js";

const formatFlashcard = (card) => ({
  id: card._id,
  documentId: card.documentId,
  question: card.question,
  answer: card.answer,
  difficulty: card.difficulty,
  createdAt: card.createdAt,
  updatedAt: card.updatedAt,
});

const requireValidDocumentId = (documentId) => {
  if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
    const error = new Error("Please provide a valid document ID.");
    error.statusCode = 400;
    throw error;
  }
};

export const generateFlashcards = asyncHandler(async (req, res) => {
  const { documentId, regenerate } = req.body;
  requireValidDocumentId(documentId);

  const { flashcards, cached } = await generateDocumentFlashcards(
    documentId,
    req.user.id,
    { regenerate: Boolean(regenerate) }
  );

  if (!cached) {
    notify(req.user.id, `${flashcards.length} flashcards were generated.`, "success");
  }

  res.status(200).json({
    success: true,
    cached,
    count: flashcards.length,
    flashcards: flashcards.map(formatFlashcard),
  });
});

export const getFlashcards = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  requireValidDocumentId(documentId);

  const flashcards = await getCachedFlashcards(documentId, req.user.id);

  res.status(200).json({
    success: true,
    count: flashcards.length,
    flashcards: flashcards.map(formatFlashcard),
  });
});

export const deleteFlashcards = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  requireValidDocumentId(documentId);

  const deletedCount = await deleteDocumentFlashcards(documentId, req.user.id);

  res.status(200).json({
    success: true,
    message: "Flashcards deleted successfully.",
    deletedCount,
  });
});
