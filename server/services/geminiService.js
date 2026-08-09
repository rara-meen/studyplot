import { GoogleGenAI } from "@google/genai";
import { config } from "../config/config.js";

// gemini-1.5-flash was fully retired by Google (requests now 404).
// gemini-2.5-flash is the current stable, generally-available replacement.
const MODEL_NAME = "gemini-2.5-flash";
const REQUEST_TIMEOUT_MS = 45000;

let client = null;

const getClient = () => {
  if (!config.geminiApiKey) {
    const error = new Error(
      "AI summaries aren't configured yet. Add a GEMINI_API_KEY to your server .env file to enable this feature."
    );
    error.statusCode = 503;
    throw error;
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: config.geminiApiKey });
  }

  return client;
};

const classifyGeminiError = (error) => {
  const message = String(error?.message || "");

  if (/429|rate limit|resource_exhausted|quota/i.test(message)) {
    const err = new Error(
      "Gemini is currently rate-limited. Please wait a moment and try again."
    );
    err.statusCode = 429;
    return err;
  }

  if (/timeout|timed out|deadline|etimedout|econnaborted/i.test(message)) {
    const err = new Error(
      "The AI took too long to respond. Please try again."
    );
    err.statusCode = 504;
    return err;
  }

  if (/enotfound|econnrefused|network|fetch failed/i.test(message)) {
    const err = new Error(
      "Couldn't reach the AI service. Check your connection and try again."
    );
    err.statusCode = 503;
    return err;
  }

  if (/api key|permission|unauthorized|403/i.test(message)) {
    const err = new Error(
      "The AI service rejected the request. Check that GEMINI_API_KEY is valid."
    );
    err.statusCode = 500;
    return err;
  }

  if (/404|not found|not supported/i.test(message)) {
    const err = new Error(
      `The AI model "${MODEL_NAME}" is unavailable. It may have been retired — check the Gemini API deprecations page.`
    );
    err.statusCode = 500;
    return err;
  }

  const err = new Error(
    "The AI service encountered an error while generating your summary."
  );
  err.statusCode = 502;
  return err;
};

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);

/**
 * Sends a single prompt to Gemini and returns the raw text response.
 */
export const generateText = async (prompt) => {
  const ai = getClient();

  try {
    const result = await withTimeout(
      ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
      }),
      REQUEST_TIMEOUT_MS
    );
    const text = result.text;

    if (!text || !text.trim()) {
      const error = new Error(
        "The AI returned an empty response. Please try again."
      );
      error.statusCode = 502;
      throw error;
    }

    return text;
  } catch (error) {
    if (error.statusCode) throw error;
    throw classifyGeminiError(error);
  }
};