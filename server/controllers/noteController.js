import mongoose from "mongoose";
import Note from "../models/Note.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { notify } from "../services/notificationService.js";

const formatNote = (note) => ({
  id: note._id,
  title: note.title,
  content: note.content,
  documentId: note.documentId || null,
  createdAt: note.createdAt,
  updatedAt: note.updatedAt,
});

const requireValidId = (id, label = "note") => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Please provide a valid ${label} ID.`);
    error.statusCode = 400;
    throw error;
  }
};

export const getNotes = asyncHandler(async (req, res) => {
  const { documentId } = req.query;
  const filter = { userId: req.user.id };

  if (documentId) {
    requireValidId(documentId, "document");
    filter.documentId = documentId;
  }

  const notes = await Note.find(filter).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    count: notes.length,
    notes: notes.map(formatNote),
  });
});

export const getNoteById = asyncHandler(async (req, res) => {
  requireValidId(req.params.id);

  const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

  if (!note) {
    const error = new Error("Note not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    note: formatNote(note),
  });
});

export const createNote = asyncHandler(async (req, res) => {
  const { title, content, documentId } = req.body;

  const trimmedTitle = String(title || "").trim();
  const trimmedContent = String(content || "").trim();

  if (!trimmedTitle && !trimmedContent) {
    const error = new Error("Please add a title or some content before saving.");
    error.statusCode = 400;
    throw error;
  }

  if (documentId) {
    requireValidId(documentId, "document");
  }

  const note = await Note.create({
    userId: req.user.id,
    title: trimmedTitle || "Untitled note",
    content: trimmedContent,
    documentId: documentId || undefined,
  });

  notify(req.user.id, `Note "${note.title}" was saved.`, "success");

  res.status(201).json({
    success: true,
    note: formatNote(note),
  });
});

export const updateNote = asyncHandler(async (req, res) => {
  requireValidId(req.params.id);

  const { title, content } = req.body;
  const updates = {};

  if (title !== undefined) updates.title = String(title).trim() || "Untitled note";
  if (content !== undefined) updates.content = String(content);

  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!note) {
    const error = new Error("Note not found.");
    error.statusCode = 404;
    throw error;
  }

  notify(req.user.id, `Note "${note.title}" was updated.`, "success");

  res.status(200).json({
    success: true,
    note: formatNote(note),
  });
});

export const deleteNote = asyncHandler(async (req, res) => {
  requireValidId(req.params.id);

  const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

  if (!note) {
    const error = new Error("Note not found.");
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    message: "Note deleted.",
  });
});
