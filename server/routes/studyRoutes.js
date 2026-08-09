import express from "express";
import {
  chatWithDocument,
  getChatHistory,
  clearChatHistory,
  getLearningStats,
  generateNoteAssist,
  getRecentActivity,
} from "../controllers/studyController.js";
import { generateSummary } from "../controllers/summaryController.js";

const router = express.Router();

router.post("/summary", generateSummary);
router.post("/chat", chatWithDocument);
router.get("/chat/:documentId", getChatHistory);
router.delete("/chat/:documentId", clearChatHistory);
router.get("/analytics", getLearningStats);
router.get("/recent", getRecentActivity);
router.post("/notes-assist", generateNoteAssist);

export default router;
