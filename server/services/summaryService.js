import Document from "../models/Document.js";
import { generateText } from "./geminiService.js";
import { chunkText } from "../utils/textChunker.js";
import { parseSummaryMarkdown } from "../utils/markdownSummaryParser.js";

const MAX_CHUNK_CHARS = 12000;

const FINAL_SUMMARY_PROMPT = (content) => `You are an expert academic tutor.

Analyze the following study material.

Return the response in Markdown with the following sections.

# Short Summary

Provide a concise overview.

# Detailed Summary

Explain the document thoroughly.

# Key Takeaways

Return 5–10 important bullet points.

# Important Definitions

Extract important concepts and definitions.

# Important Facts

List the most important facts students should remember.

# Exam Tips

Mention what a student should focus on before an exam.

Only use information from the provided document.

Never invent information.

Study material:
"""
${content}
"""`;

const PARTIAL_SUMMARY_PROMPT = (chunk, index, total) => `You are an expert academic tutor summarizing part ${
  index + 1
} of ${total} of a longer study document.

Summarize the key ideas, definitions, and facts from the following excerpt in clear, concise bullet points. Only use information from the excerpt. Never invent information.

Excerpt:
"""
${chunk}
"""`;

/**
 * Combines a large document into a single block of source content that fits
 * within Gemini's practical prompt size, generating partial summaries for
 * each chunk first when the document is too large for a single request.
 */
const buildSourceContent = async (extractedText) => {
  const chunks = chunkText(extractedText, MAX_CHUNK_CHARS);

  if (chunks.length <= 1) {
    return extractedText;
  }

  const partialSummaries = [];
  for (let i = 0; i < chunks.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const partial = await generateText(
      PARTIAL_SUMMARY_PROMPT(chunks[i], i, chunks.length)
    );
    partialSummaries.push(`Part ${i + 1} of ${chunks.length}:\n${partial}`);
  }

  return partialSummaries.join("\n\n");
};

export const generateDocumentSummary = async (
  documentId,
  userId,
  { regenerate = false } = {}
) => {
  const document = await Document.findOne({ _id: documentId, userId });

  if (!document) {
    const error = new Error("Document not found.");
    error.statusCode = 404;
    throw error;
  }

  if (!document.extractedText || !document.extractedText.trim()) {
    const error = new Error(
      "This document doesn't have any extracted text to summarize. Try re-uploading the PDF."
    );
    error.statusCode = 422;
    throw error;
  }

  const hasCachedSummary =
    document.summaryGeneratedAt && document.summary?.shortSummary;

  if (!regenerate && hasCachedSummary) {
    return {
      summary: document.summary,
      cached: true,
      generatedAt: document.summaryGeneratedAt,
      version: document.summaryVersion,
    };
  }

  const sourceContent = await buildSourceContent(document.extractedText);
  const finalMarkdown = await generateText(FINAL_SUMMARY_PROMPT(sourceContent));
  const structuredSummary = parseSummaryMarkdown(finalMarkdown);

  document.summary = structuredSummary;
  document.summaryGeneratedAt = new Date();
  document.summaryVersion = (document.summaryVersion || 0) + 1;
  await document.save();

  return {
    summary: structuredSummary,
    cached: false,
    generatedAt: document.summaryGeneratedAt,
    version: document.summaryVersion,
  };
};
