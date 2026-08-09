import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import { config } from "./config/config.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import studyRoutes from "./routes/studyRoutes.js";
import flashcardRoutes from "./routes/flashcardRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { protect } from "./middleware/auth.js";

connectDB();

const app = express();

app.use(cors({ origin: config.clientUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "StudyPlot API is running.",
  });
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/documents", protect, documentRoutes);
app.use("/api/upload", protect, uploadRoutes);
app.use("/api/study/flashcards", protect, flashcardRoutes);
app.use("/api/study/quiz", protect, quizRoutes);
app.use("/api/study", protect, studyRoutes);
app.use("/api/notes", protect, noteRoutes);
app.use("/api/notifications", protect, notificationRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`StudyPlot server running on port ${config.port}`);
});
