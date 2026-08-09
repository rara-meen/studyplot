import fs from "fs";
import Document from "../models/Document.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { formatDocument } from "./uploadController.js";
import { notify } from "../services/notificationService.js";

export const getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ userId: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: documents.length,
    documents: documents.map(formatDocument),
  });
});

export const getDocumentById = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });

  if (!document) {
    const error = new Error("Document not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    document: {
      ...formatDocument(document),
      extractedText: document.extractedText,
      summary: document.summary,
    },
  });
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findOne({ _id: req.params.id, userId: req.user.id });

  if (!document) {
    const error = new Error("Document not found.");
    error.statusCode = 404;
    throw error;
  }

  if (document.uploadPath && fs.existsSync(document.uploadPath)) {
    fs.unlink(document.uploadPath, () => {});
  }

  await document.deleteOne();

  notify(req.user.id, `"${document.title}" was deleted.`, "info");

  res.status(200).json({
    success: true,
    message: "Document deleted successfully.",
  });
});
