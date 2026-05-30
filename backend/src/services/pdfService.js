const pdfParse = require('pdf-parse');

/**
 * Ekstraksi teks dari PDF Buffer dan memformatnya menjadi Markdown standar.
 * @param {Buffer} pdfBuffer - Buffer file PDF
 * @returns {Promise<{markdown: string, pages: number, sizeMdBytes: number, errorType?: string}>}
 */
async function parsePdfToMarkdown(pdfBuffer) {
  try {
    // pdf-parse opsi default
    const options = {
      // Custom pagerenderer untuk menangani spasi paragraf dengan lebih baik
      pagerender: function (pageData) {
        return pageData.getTextContent().then(function (textContent) {
          let lastY, text = '';
          for (let item of textContent.items) {
            if (lastY !== undefined && lastY !== item.transform[5]) {
              text += '\n';
            }
            text += item.str;
            lastY = item.transform[5];
          }
          return text;
        });
      }
    };

    const data = await pdfParse(pdfBuffer, options);

    const rawText = data.text;
    const pages = data.numpages || 1;

    // Deteksi PDF kosong / hasil scan (tidak ada teks)
    const cleanText = rawText.replace(/\s+/g, '');
    if (cleanText.length < 10) {
      return {
        markdown: '',
        pages: pages,
        sizeMdBytes: 0,
        errorType: 'SCAN_ONLY'
      };
    }

    // Ubah teks mentah menjadi format Markdown sederhana tapi rapi
    const markdown = formatTextToMarkdown(rawText);

    return {
      markdown: markdown,
      pages: pages,
      sizeMdBytes: Buffer.byteLength(markdown, 'utf8')
    };

  } catch (error) {
    // Deteksi PDF terproteksi password / terenkripsi
    if (error.message && (
      error.message.includes('password') || 
      error.message.includes('encrypted') || 
      error.message.includes('Warning: Password Required') ||
      error.code === 1 // pdf.js password error
    )) {
      return {
        markdown: '',
        pages: 0,
        sizeMdBytes: 0,
        errorType: 'ENCRYPTED'
      };
    }

    throw error;
  }
}

/**
 * Memformat teks kasar hasil ekstraksi PDF menjadi Markdown terstruktur
 * @param {string} text - Teks mentah PDF
 * @returns {string} - Teks berformat Markdown
 */
function formatTextToMarkdown(text) {
  const lines = text.split('\n');
  const formattedLines = [];
  let isInsideList = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      formattedLines.push('');
      isInsideList = false;
      continue;
    }

    // Deteksi Header Utama (semua huruf besar, relatif pendek, bukan list)
    if (line.length < 60 && line === line.toUpperCase() && !/^[0-9•\-\*]/.test(line) && isNaN(line)) {
      formattedLines.push(`\n## ${capitalizeWords(line.toLowerCase())}\n`);
      isInsideList = false;
      continue;
    }

    // Deteksi Bullet Lists (diawali dot, dash, asterisk)
    if (/^[•\-\*]\s+/.test(line)) {
      const cleanItem = line.replace(/^[•\-\*]\s+/, '');
      formattedLines.push(`- ${cleanItem}`);
      isInsideList = true;
      continue;
    }

    // Deteksi Numbered Lists (1., 2. dll)
    if (/^\d+[\.\)]\s+/.test(line)) {
      const match = line.match(/^(\d+)[\.\)]\s+(.*)/);
      if (match) {
        formattedLines.push(`${match[1]}. ${match[2]}`);
        isInsideList = true;
        continue;
      }
    }

    // Menangani sambungan kalimat yang terpotong baris baru
    if (formattedLines.length > 0 && isInsideList === false) {
      const lastLineIndex = formattedLines.length - 1;
      const lastLine = formattedLines[lastLineIndex];

      // Jika baris terakhir tidak kosong, dan tidak diakhiri tanda baca titik/tanya/seru
      if (lastLine && !/[.!?]$/.test(lastLine) && !lastLine.startsWith('#') && !lastLine.startsWith('-') && !/^\d+\./.test(lastLine)) {
        formattedLines[lastLineIndex] = lastLine + ' ' + line;
        continue;
      }
    }

    formattedLines.push(line);
  }

  // Gabungkan baris dan rapikan spasi berlebih
  return formattedLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Mengubah huruf pertama setiap kata menjadi huruf besar
 * @param {string} str - Input string
 */
function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

module.exports = {
  parsePdfToMarkdown
};
