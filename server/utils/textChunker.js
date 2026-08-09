/**
 * Splits text into chunks no larger than maxChunkChars, breaking on
 * paragraph boundaries where possible so sentences aren't cut mid-thought.
 * Falls back to hard-splitting any single paragraph that exceeds the limit.
 */
export const chunkText = (text, maxChunkChars = 12000) => {
  if (!text) return [];

  const trimmed = text.trim();
  if (trimmed.length <= maxChunkChars) {
    return [trimmed];
  }

  const paragraphs = trimmed.split(/\n{2,}/);
  const chunks = [];
  let current = "";

  const pushCurrent = () => {
    if (current.trim()) {
      chunks.push(current.trim());
    }
    current = "";
  };

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length > maxChunkChars && current) {
      pushCurrent();
      current = paragraph;
    } else {
      current = candidate;
    }

    // A single paragraph longer than the limit on its own — hard split it.
    while (current.length > maxChunkChars) {
      chunks.push(current.slice(0, maxChunkChars).trim());
      current = current.slice(maxChunkChars);
    }
  }

  pushCurrent();

  return chunks;
};
