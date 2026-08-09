import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path to the bundled standard font data so pdfjs-dist can render text
// from PDFs that reference the 14 standard PDF fonts without embedding them.
// Must be a proper file:// URL (with trailing slash) — a raw Windows path
// like "C:\...\standard_fonts\" is not valid URL syntax and pdfjs-dist
// will throw "Invalid factory url" if passed directly.
const STANDARD_FONT_DATA_URL = `${pathToFileURL(
  path.join(__dirname, "..", "node_modules", "pdfjs-dist", "standard_fonts")
).href}/`;

/**
 * Parses a PDF file from disk and extracts its text, page count,
 * and any available metadata.
 * @param {string} filePath - Absolute path to the PDF file on disk.
 */
export const parsePdf = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);

  try {
    const loadingTask = getDocument({
      data: new Uint8Array(dataBuffer),
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
      verbosity: 0,
    });
    const pdf = await loadingTask.promise;

    let fullText = "";
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str).join(" ");
      fullText += `${pageText}\n\n`;
    }

    const metadata = await pdf.getMetadata().catch(() => null);

    return {
      text: fullText.trim(),
      pageCount: pdf.numPages || 0,
      metadata: metadata?.info || {},
    };
  } catch (error) {
    const parseError = new Error(
      "Failed to parse the PDF. The file may be corrupted or password-protected."
    );
    parseError.statusCode = 422;
    throw parseError;
  }
};