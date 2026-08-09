import Document from "../models/Document.js";
import Chat from "../models/Chat.js";
import { generateText } from "./geminiService.js";

const MAX_CONTEXT_CHARS = 30000;
const MAX_HISTORY_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 4000;

const buildPrompt = (document, historyMessages, question) => {
  const hasDocument = Boolean(document?.extractedText?.trim());

  const documentSection = hasDocument
    ? `The student is studying the following document titled "${
        document.title || document.originalFilename
      }". Base your answer on it whenever the question relates to it. If the document doesn't contain the answer, say so honestly instead of guessing — never invent information.

Document:
"""
${document.extractedText.slice(0, MAX_CONTEXT_CHARS)}
"""`
    : "No document is currently attached to this conversation. Answer using your general knowledge, and if the student asks something that would need their notes, let them know they can upload a PDF first.";

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
