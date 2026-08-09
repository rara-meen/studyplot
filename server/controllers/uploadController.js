import fs from "fs";
import Document from "../models/Document.js";
import { parsePdf } from "../services/pdfParser.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notify } from "../services/notificationService.js";

const bytesToLabel = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDocument = (doc) => ({
  id: doc._id,
  title: doc.title,
  originalFilename: doc.originalFilename,
  fileSize: doc.fileSize,
  fileSizeLabel: bytesToLabel(doc.fileSize),
  mimeType: doc.mimeType,
  uploadedAt: doc.uploadedAt,
  pageCount: doc.pageCount,
  hasSummary: Boolean(doc.summaryGeneratedAt && doc.summary?.shortSummary),
  summaryGeneratedAt: doc.summaryGeneratedAt || null,
});

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    const error = new Error("No file was uploaded. Please select a PDF.");
    error.statusCode = 400;
    throw error;
  }

  let parsed;
  try {
    parsed = await parsePdf(req.file.path);
  } catch (parseError) {
    // Clean up the stored file if parsing fails, so we don't keep orphaned uploads.
    fs.unlink(req.file.path, () => {});
    throw parseError;
  }

  const title = req.file.originalname.replace(/\.pdf$/i, "");

  let document;
  try {
    document = await Document.create({
      userId: req.user.id,
      title,
      originalFilename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadPath: req.file.path,
      pageCount: parsed.pageCount,
      extractedText: parsed.text,
    });
  } catch (dbError) {
    fs.unlink(req.file.path, () => {});
    const error = new Error(
      "Failed to save the document. Please try again."
    );
    error.statusCode = 500;
    throw error;
  }

  notify(req.user.id, `"${document.title}" was uploaded successfully.`, "success");

  res.status(201).json({
    success: true,
    message: "Document uploaded and parsed successfully.",
    document: formatDocument(document),
  });
});

export { formatDocument };
