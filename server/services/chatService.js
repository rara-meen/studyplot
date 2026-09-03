import Document from "../models/Document.js";
import Chat from "../models/Chat.js";
import { generateText } from "./geminiService.js";

// Fallback cap only used when no summary exists yet (raw extracted text is
// far more expensive per-message than a summary, so this stays small).
const MAX_RAW_CONTEXT_CHARS = 12000;
const MAX_HISTORY_MESSAGES = 6;
const MAX_MESSAGE_LENGTH = 4000;

/**
 * Builds the document-grounding section of the chat prompt.
 *
 * Token efficiency: a chat conversation calls this on every single message,
 * so whatever goes here gets paid for repeatedly — unlike Summary/Flashcards/
 * Quiz, which each only pay for their context once per generation. Using the
 * document's existing summary (a few hundred to ~2,000 characters) instead of
 * the full extracted text (which can run tens of thousands of characters)
 * cuts the per-message context cost roughly 10-15x for any document that's
 * already been summarized, with no extra Gemini calls needed since the
 * summary is already sitting in the database.
 */
export const buildDocumentSection = (document) => {
  const hasSummary = Boolean(document?.summaryGeneratedAt && document?.summary?.detailedSummary);
  const hasRawText = Boolean(document?.extractedText?.trim());

  if (!hasSummary && !hasRawText) {
    return "No document is currently attached to this conversation. Answer using your general knowledge, and if the student asks something that would need their notes, let them know they can upload a PDF first.";
  }

  const title = document.title || document.originalFilename;

  if (hasSummary) {
    const { detailedSummary, keyTakeaways = [], definitions = [] } = document.summary;
    const extras = [
      keyTakeaways.length > 0 ? `Key takeaways:\n- ${keyTakeaways.join("\n- ")}` : "",
      definitions.length > 0 ? `Key terms:\n- ${definitions.join("\n- ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return `The student is studying "${title}". Base your answer on the summary below whenever the question relates to it. If it doesn't contain enough detail to answer precisely, say so honestly rather than guessing — never invent information.

Document summary:
"""
${detailedSummary}
${extras ? `\n${extras}` : ""}
"""`;
  }

  // No summary generated yet — fall back to a capped slice of the raw text.
  return `The student is studying "${title}". Base your answer on the excerpt below whenever the question relates to it. If it doesn't contain the answer, say so honestly instead of guessing — never invent information.

Document excerpt:
"""
${document.extractedText.slice(0, MAX_RAW_CONTEXT_CHARS)}
"""`;
};

const buildPrompt = (document, historyMessages, question) => {
  const documentSection = buildDocumentSection(document);

  const historySection =
    historyMessages.length > 0
      ? `Recent conversation:\n${historyMessages
          .map((m) => `${m.role === "user" ? "Student" : "Assistant"}: ${m.content}`)
          .join("\n")}\n`
      : "";

  return `You are StudyPlot's AI study assistant. You help students understand their study material by answering questions clearly and helpfully.

${documentSection}

${historySection}Student: ${question}

Respond conversationally and use Markdown formatting (headings, bold text, bullet points, code blocks) where it improves clarity. Keep answers focused — expand only if the student asks for more detail.`;
};

const formatMessage = (message) => ({
  id: message._id,
  role: message.role,
  content: message.content,
  createdAt: message.createdAt,
});

export const getConversation = async (documentId, userId) => {
  const chat = await Chat.findOne({ documentId, userId });
  return chat ? chat.messages.map(formatMessage) : [];
};

export const sendMessage = async (documentId, userId, rawMessage) => {
  const question = String(rawMessage || "").trim();

  if (!question) {
    const error = new Error("Please enter a message.");
    error.statusCode = 400;
    throw error;
  }

  if (question.length > MAX_MESSAGE_LENGTH) {
    const error = new Error(
      `Messages are limited to ${MAX_MESSAGE_LENGTH} characters. Please shorten your question.`
    );
    error.statusCode = 400;
    throw error;
  }

  const document = await Document.findOne({ _id: documentId, userId });

  if (!document) {
    const error = new Error("Document not found.");
    error.statusCode = 404;
    throw error;
  }

  let chat = await Chat.findOne({ documentId, userId });
  if (!chat) {
    chat = new Chat({ userId, documentId, messages: [] });
  }

  const recentHistory = chat.messages.slice(-MAX_HISTORY_MESSAGES);
  const prompt = buildPrompt(document, recentHistory, question);

  const replyText = await generateText(prompt);

  chat.messages.push({ role: "user", content: question });
  chat.messages.push({ role: "assistant", content: replyText.trim() });
  await chat.save();

  const savedMessages = chat.messages.slice(-2);

  return {
    userMessage: formatMessage(savedMessages[0]),
    assistantMessage: formatMessage(savedMessages[1]),
  };
};

export const clearConversation = async (documentId, userId) => {
  const result = await Chat.findOneAndUpdate(
    { documentId, userId },
    { $set: { messages: [] } }
  );
  return Boolean(result);
};
