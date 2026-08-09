import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import { generateText } from "./geminiService.js";
import { parseFlashcardsJson } from "../utils/flashcardParser.js";

const MAX_CONTENT_CHARS = 40000;

const FLASHCARD_PROMPT = (content) => `You are an expert academic tutor.

Create study flashcards from the following document.

Requirements

Generate exactly 15 flashcards.

Each flashcard should contain

Question

Answer

Difficulty

(Easy, Medium, Hard)

Keep answers concise.

Focus on important concepts.

Do not invent information.

Return JSON only.

Return a JSON array of exactly 15 objects. Each object must have exactly these keys: "question" (string), "answer" (string), and "difficulty" (one of "Easy", "Medium", "Hard"). Do not include markdown code fences, explanations, or any text outside the JSON array.

Document:
"""
${content}
"""`;

export const getCachedFlashcards = (documentId, userId) =>
  Flashcard.find({ documentId, userId }).sort({ createdAt: 1 });

export const generateDocumentFlashcards = async (
  documentId,
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
      "This document doesn't have any extracted text to generate flashcards from. Try re-uploading the PDF."
    );
    error.statusCode = 422;
    throw error;
  }

  if (!regenerate) {
    const existing = await getCachedFlashcards(documentId, userId);
    if (existing.length > 0) {
      return { flashcards: existing, cached: true };
    }
  }

  const content = document.extractedText.slice(0, MAX_CONTENT_CHARS);
  const rawResponse = await generateText(FLASHCARD_PROMPT(content));
  const parsedCards = parseFlashcardsJson(rawResponse);

  let created;
  try {
    await Flashcard.deleteMany({ documentId, userId });
    created = await Flashcard.insertMany(
      parsedCards.map((card) => ({
        userId,
        documentId,
        question: card.question,
        answer: card.answer,
        difficulty: card.difficulty,
      }))
    );
  } catch (dbError) {
    const error = new Error(
      "Flashcards were generated but couldn't be saved. Please try again."
    );
    error.statusCode = 500;
    throw error;
  }

  return { flashcards: created, cached: false };
};

export const deleteDocumentFlashcards = async (documentId, userId) => {
  const result = await Flashcard.deleteMany({ documentId, userId });
  return result.deletedCount;
};
