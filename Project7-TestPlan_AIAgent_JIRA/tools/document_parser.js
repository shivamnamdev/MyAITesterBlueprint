/**
 * tools/document_parser.js
 * Layer 3 — Document Parser for Supplemental Requirements
 *
 * Extracts clean plain text from uploaded files (DOCX, PDF, Markdown, TXT, JSON, YAML).
 */

'use strict';

const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extracts plain text from an uploaded file payload
 * @param {Object} fileObj - { name, type, contentBase64, rawText }
 * @returns {Promise<{ filename: string, text: string, charCount: number }>}
 */
async function parseUploadedDocument(fileObj) {
  if (!fileObj) return { filename: '', text: '', charCount: 0 };

  const filename = fileObj.name || 'uploaded_doc';
  const ext = filename.split('.').pop()?.toLowerCase();
  let extractedText = '';

  // If rawText was already read directly on the client (e.g. for txt/md/json)
  if (fileObj.rawText && typeof fileObj.rawText === 'string') {
    extractedText = fileObj.rawText;
  } else if (fileObj.contentBase64) {
    const buffer = Buffer.from(fileObj.contentBase64, 'base64');

    if (ext === 'pdf') {
      try {
        const parsedPdf = await pdfParse(buffer);
        extractedText = parsedPdf.text || '';
      } catch (pdfErr) {
        throw new Error(`Failed to parse PDF document (${filename}): ${pdfErr.message}`);
      }
    } else if (ext === 'docx' || ext === 'doc') {
      try {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
      } catch (docxErr) {
        throw new Error(`Failed to parse Word document (${filename}): ${docxErr.message}`);
      }
    } else {
      // Treat as UTF-8 text (txt, md, json, csv, yaml)
      extractedText = buffer.toString('utf8');
    }
  }

  // Clean up whitespace and restrict maximum length (safety bound: 60k chars)
  let cleaned = extractedText
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  const MAX_CHARS = 60000;
  if (cleaned.length > MAX_CHARS) {
    cleaned =
      cleaned.substring(0, MAX_CHARS) +
      `\n\n[... Remaining content truncated for token limits (${cleaned.length} total characters) ...]`;
  }

  return {
    filename,
    text: cleaned,
    charCount: cleaned.length,
  };
}

module.exports = {
  parseUploadedDocument,
};
