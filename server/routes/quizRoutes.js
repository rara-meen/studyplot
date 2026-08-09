import express from "express";
import {
  generateQuiz,
  getQuiz,
  deleteQuiz,
  submitQuizScore,
} from "../controllers/quizController.js";

const router = express.Router();

router.post("/", generateQuiz);
router.get("/:documentId", getQuiz);
router.delete("/:documentId", deleteQuiz);
router.post("/:documentId/score", submitQuizScore);

export default router;
