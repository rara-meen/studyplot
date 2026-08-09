import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateDocumentSummary } from "../services/summaryService.js";
import { notify } from "../services/notificationService.js";

export const generateSummary = asyncHandler(async (req, res) => {
  const { documentId, regenerate } = req.body;

  if (!documentId || !mongoose.Types.ObjectId.isValid(documentId)) {
    const error = new Error("Please provide a valid document ID.");
    error.statusCode = 400;
    throw error;
  }

  const { summary, cached, generatedAt, version } = await generateDocumentSummary(
    documentId,
    req.user.id,
    { regenerate: Boolean(regenerate) }
  );

  if (!cached) {
    notify(req.user.id, "AI summary was generated.", "success");
  }

  res.status(200).json({
    success: true,
    summary,
    cached,
    generatedAt,
    version,
  });
});
