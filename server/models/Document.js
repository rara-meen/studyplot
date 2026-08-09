import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "",
    },
    originalFilename: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    pageCount: {
      type: Number,
      default: 0,
    },
    extractedText: {
      type: String,
      default: "",
    },
    uploadPath: {
      type: String,
      required: true,
    },
    summary: {
      shortSummary: { type: String, default: "" },
      detailedSummary: { type: String, default: "" },
      keyTakeaways: { type: [String], default: [] },
      definitions: { type: [String], default: [] },
      importantFacts: { type: [String], default: [] },
      examTips: { type: [String], default: [] },
    },
    summaryGeneratedAt: {
      type: Date,
      default: null,
    },
    summaryVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
