const mammoth = require('mammoth');

/**
 * Ekstraksi teks dari berkas Word (.docx) Buffer dan mengubahnya menjadi Markdown standar.
 * @param {Buffer} docxBuffer - Buffer file .docx
 * @returns {Promise<{markdown: string, pages: number, sizeMdBytes: number}>}
 */
async function parseDocxToMarkdown(docxBuffer) {
  try {
    const result = await mammoth.convertToMarkdown({ buffer: docxBuffer });
    const markdown = result.value || ''; // Markdown hasil ekstraksi

    // Estimasi halaman berdasarkan jumlah kata (misalnya ~400 kata per halaman)
    const wordCount = markdown.split(/\s+/).filter(word => word.length > 0).length;
    const estimatedPages = Math.max(1, Math.ceil(wordCount / 400));

    return {
      markdown: markdown,
      pages: estimatedPages,
      sizeMdBytes: Buffer.byteLength(markdown, 'utf8')
    };
  } catch (error) {
    throw new Error(`Gagal memproses file Word (.docx): ${error.message}`);
  }
}

module.exports = {
  parseDocxToMarkdown
};
