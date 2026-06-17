const crypto = require('crypto');
const { parsePdfToMarkdown } = require('../services/pdfService');
const { parseDocxToMarkdown } = require('../services/docxService');
const { createZipArchive } = require('../services/zipService');

// Penyimpanan in-memory stateless sederhana untuk menyimpan hasil konversi sementara
// Dalam produksi, ini bisa berupa Redis atau database temporary dengan TTL
const sessionStore = new Map();

// Menghapus data sesi setelah 1 jam untuk mencegah kebocoran memori RAM
const SESSION_TTL_MS = 60 * 60 * 1000; 

/**
 * Endpoint POST /api/convert
 * Mengunggah banyak file PDF/Word sekaligus, memprosesnya secara asinkron, dan menyimpan hasilnya.
 */
async function convertBulkPdf(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Tidak ada file PDF atau Word yang diunggah!' });
    }

    const sessionId = crypto.randomUUID();
    const results = [];

    // Proses setiap file
    for (const file of req.files) {
      const fileId = crypto.randomUUID();
      const originalName = file.originalname;
      const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
      const mdFilename = `${baseName}.md`;

      try {
        let parsedData;
        const isDocx = file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || originalName.endsWith('.docx');
        
        if (isDocx) {
          parsedData = await parseDocxToMarkdown(file.buffer);
        } else {
          parsedData = await parsePdfToMarkdown(file.buffer);
        }

        if (parsedData.errorType) {
          results.push({
            id: fileId,
            name: originalName,
            mdFilename: mdFilename,
            size: file.size,
            pages: parsedData.pages,
            markdown: '',
            sizeMdBytes: 0,
            status: 'ERROR',
            errorType: parsedData.errorType // 'SCAN_ONLY' atau 'ENCRYPTED'
          });
        } else {
          results.push({
            id: fileId,
            name: originalName,
            mdFilename: mdFilename,
            size: file.size,
            pages: parsedData.pages,
            markdown: parsedData.markdown,
            sizeMdBytes: parsedData.sizeMdBytes,
            status: 'SUCCESS'
          });
        }
      } catch (err) {
        console.error(`Gagal memproses file ${originalName}:`, err);
        results.push({
          id: fileId,
          name: originalName,
          mdFilename: mdFilename,
          size: file.size,
          pages: 0,
          markdown: '',
          sizeMdBytes: 0,
          status: 'ERROR',
          errorType: 'GENERAL_ERROR',
          errorMessage: err.message
        });
      }
    }

    // Simpan hasil konversi di store in-memory
    sessionStore.set(sessionId, {
      createdAt: Date.now(),
      files: results
    });

    // Jalankan timer untuk menghapus sesi otomatis setelah 1 jam
    setTimeout(() => {
      sessionStore.delete(sessionId);
    }, SESSION_TTL_MS);

    // Kirim rekap hasil konversi ke frontend
    return res.json({
      sessionId: sessionId,
      files: results.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        pages: f.pages,
        markdown: f.markdown,
        sizeMdBytes: f.sizeMdBytes,
        status: f.status,
        errorType: f.errorType,
        errorMessage: f.errorMessage
      }))
    });

  } catch (error) {
    console.error('Error pada endpoint bulk convert:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan internal server saat memproses konversi!' });
  }
}

/**
 * Endpoint GET /api/download/:id
 * Mengunduh file ZIP hasil bulk conversion, atau file MD satuan jika disertakan query ?fileId=...
 */
async function downloadConvertedFiles(req, res) {
  try {
    const sessionId = req.params.id;
    const { fileId } = req.query;

    const session = sessionStore.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Sesi unduhan tidak ditemukan atau telah kedaluwarsa!' });
    }

    // 1. Opsi Download File Satuan (.md) jika ?fileId=... disediakan
    if (fileId) {
      const file = session.files.find(f => f.id === fileId);
      if (!file) {
        return res.status(404).json({ error: 'File tidak ditemukan!' });
      }

      if (file.status === 'ERROR') {
        return res.status(400).json({ error: 'File ini gagal dikonversi sehingga tidak dapat diunduh!' });
      }

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.mdFilename)}"`);
      return res.send(file.markdown);
    }

    // 2. Opsi Default: Download Semua File Sukses sebagai ZIP
    const successFiles = session.files.filter(f => f.status === 'SUCCESS');
    if (successFiles.length === 0) {
      return res.status(400).json({ error: 'Tidak ada file sukses yang dapat dimasukkan ke dalam ZIP!' });
    }

    const zipFilesList = successFiles.map(f => ({
      filename: f.mdFilename,
      content: f.markdown
    }));

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="BulkPDF2MD-Converted.zip"');

    // Alirkan ZIP ke response stream
    await createZipArchive(zipFilesList, res);

  } catch (error) {
    console.error('Error pada endpoint download:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Gagal membuat file unduhan!' });
    }
  }
}

module.exports = {
  convertBulkPdf,
  downloadConvertedFiles
};
