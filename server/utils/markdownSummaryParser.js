const HEADING_MAP = {
  "short summary": "shortSummary",
  "detailed summary": "detailedSummary",
  "key takeaways": "keyTakeaways",
  "important definitions": "definitions",
  definitions: "definitions",
  "important facts": "importantFacts",
  "exam tips": "examTips",
};

const PROSE_KEYS = new Set(["shortSummary", "detailedSummary"]);

const toBulletList = (content) =>
  content
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);

/**
 * Converts the Gemini markdown response (structured with # headings) into
 * the flat JSON shape the /api/study/summary endpoint returns.
 */
export const parseSummaryMarkdown = (markdown) => {
  const result = {
    shortSummary: "",
    detailedSummary: "",
    keyTakeaways: [],
    definitions: [],
    importantFacts: [],
    examTips: [],
  };

  if (!markdown || !markdown.trim()) {
    return result;
  }

  const lines = markdown.split("\n");
  let currentKey = null;
  let buffer = [];

  const flush = () => {
    if (!currentKey) {
      buffer = [];
      return;
    }
    const content = buffer.join("\n").trim();
    result[currentKey] = PROSE_KEYS.has(currentKey)
      ? content
      : toBulletList(content);
    buffer = [];
  };

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+?)\s*$/);
    if (headingMatch) {
      flush();
      const headingText = headingMatch[1].trim().toLowerCase();
      currentKey = HEADING_MAP[headingText] || null;
      continue;
    }
    buffer.push(line);
  }
  flush();

  return result;
};
