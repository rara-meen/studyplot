import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  getConversation,
  sendMessage,
  clearConversation,
} from "../services/chatService.js";
import { runNotesAssist } from "../services/notesAssistService.js";
import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import Note from "../models/Note.js";
import Chat from "../models/Chat.js";
const requireValidDocumentId = (documentId) => {
  if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
    const error = new Error("Please provide a valid document ID.");
    error.statusCode = 400;
    throw error;
  }
};

export const chatWithDocument = asyncHandler(async (req, res) => {
  const { documentId, message } = req.body;
  requireValidDocumentId(documentId);

  const { userMessage, assistantMessage } = await sendMessage(
    documentId,
    req.user.id,
    message
  );

  res.status(200).json({
    success: true,
    userMessage,
    assistantMessage,
  });
});

export const getChatHistory = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  requireValidDocumentId(documentId);

  const messages = await getConversation(documentId, req.user.id);

  res.status(200).json({
    success: true,
    count: messages.length,
    messages,
  });
});

export const clearChatHistory = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  requireValidDocumentId(documentId);

  await clearConversation(documentId, req.user.id);

  res.status(200).json({
    success: true,
    message: "Conversation cleared.",
  });
});

export const getLearningStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [
    documentsCount,
    summariesGeneratedCount,
    flashcardsCount,
    quizzesGeneratedCount,
    notesCount,
    conversationsCount,
    questionsAskedAgg,
  ] = await Promise.all([
    Document.countDocuments({ userId }),
    Document.countDocuments({ userId, summaryGeneratedAt: { $ne: null } }),
    Flashcard.countDocuments({ userId }),
    Quiz.countDocuments({ userId }),
    Note.countDocuments({ userId }),
    Chat.countDocuments({ userId, "messages.0": { $exists: true } }),
    Chat.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$messages" },
      { $match: { "messages.role": "user" } },
      { $count: "count" },
    ]),
  ]);

  const questionsAskedCount = questionsAskedAgg[0]?.count || 0;

  res.status(200).json({
    success: true,
    stats: {
      documentsCount,
      summariesGeneratedCount,
      flashcardsCount,
      quizzesGeneratedCount,
      notesCount,
      conversationsCount,
      questionsAskedCount,
    },
  });
});

export const generateNoteAssist = asyncHandler(async (req, res) => {
  const { action, content } = req.body;
  const result = await runNotesAssist(action, content);

  res.status(200).json({
    success: true,
    result,
  });
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const [recentFlashcardGroups, recentQuizzes] = await Promise.all([
    Flashcard.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$documentId",
          createdAt: { $max: "$createdAt" },
          count: { $sum: 1 },
        },
      },
      { $sort: { createdAt: -1 } },
      { $limit: 3 },
    ]),
    Quiz.find({ userId }).sort({ updatedAt: -1 }).limit(3),
  ]);

  const documentIds = [
    ...recentFlashcardGroups.map((group) => group._id),
    ...recentQuizzes.map((quiz) => quiz.documentId),
  ];

  const documents = await Document.find({ _id: { $in: documentIds } }).select(
    "title originalFilename"
  );
  const titleMap = new Map(
    documents.map((doc) => [doc._id.toString(), doc.title || doc.originalFilename])
  );

  res.status(200).json({
    success: true,
    recentFlashcards: recentFlashcardGroups.map((group) => ({
      documentId: group._id,
      documentTitle: titleMap.get(group._id.toString()) || "Untitled document",
      count: group.count,
      createdAt: group.createdAt,
    })),
    recentQuizzes: recentQuizzes.map((quiz) => ({
      id: quiz._id,
      documentId: quiz.documentId,
      documentTitle: titleMap.get(quiz.documentId.toString()) || "Untitled document",
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length,
      updatedAt: quiz.updatedAt,
    })),
  });
});
