import express from "express";
import {
  generateFlashcards,
  getFlashcards,
  deleteFlashcards,
} from "../controllers/flashcardController.js";

const router = express.Router();

router.post("/", generateFlashcards);
router.get("/:documentId", getFlashcards);
router.delete("/:documentId", deleteFlashcards);

export default router;
