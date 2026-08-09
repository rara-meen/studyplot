import { generateText } from "./geminiService.js";

const MAX_INPUT_CHARS = 20000;

const ACTION_PROMPTS = {
  "revision-points": (content) =>
    `Turn the following notes into a concise, well-organized set of bullet-point revision notes. Keep only the key facts and ideas, and use Markdown bullet points.

Notes:
"""
${content}
"""`,
  explain: (content) =>
    `Explain the following notes in simple, clear language, as if teaching a beginner. Use short paragraphs and avoid jargon where possible.

Notes:
"""
${content}
"""`,
  organize: (content) =>
    `Reorganize and clean up the following notes: fix the structure, add clear Markdown headings and bullet points where helpful, and remove redundancy. Do not remove any factual content.

Notes:
"""
${content}
"""`,
};

export const runNotesAssist = async (action, rawContent) => {
  const content = String(rawContent || "").trim();

  if (!content) {
    const error = new Error("Add some note content first.");
    error.statusCode = 400;
    throw error;
  }

  const buildPrompt = ACTION_PROMPTS[action];

  if (!buildPrompt) {
    const error = new Error("Unsupported AI action.");
    error.statusCode = 400;
    throw error;
  }

  const prompt = buildPrompt(content.slice(0, MAX_INPUT_CHARS));
  const result = await generateText(prompt);

  return result.trim();
};
