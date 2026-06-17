const crypto = require('crypto');
const { parsePdfToMarkdown } = require('../services/pdfService');
const { parseDocxToMarkdown } = require('../services/docxService');
const { processMetadata } = require('../services/metadataService');
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

    const { sessionId: querySessionId } = req.query;
    let sessionId = querySessionId;
    let results = [];
    let existingSession = null;

    if (sessionId) {
      existingSession = sessionStore.get(sessionId);
    }

    if (!existingSession) {
      sessionId = crypto.randomUUID();
    } else {
      // Duplikasi array file yang sudah sukses dikonversi sebelumnya
      results = [...existingSession.files];
    }

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
          // Cari & ekstrak DOI + metadata CrossRef
          let metadataObj = null;
          try {
            metadataObj = await processMetadata(parsedData.markdown, baseName);
          } catch (metaErr) {
            console.error('Meta parsing error:', metaErr);
          }

          results.push({
            id: fileId,
            name: originalName,
            mdFilename: mdFilename,
            size: file.size,
            pages: parsedData.pages,
            markdown: parsedData.markdown,
            sizeMdBytes: parsedData.sizeMdBytes,
            status: 'SUCCESS',
            hasMetadata: !!metadataObj,
            metadata: metadataObj ? {
              doi: metadataObj.doi,
              title: metadataObj.title,
              authors: metadataObj.authors,
              journal: metadataObj.journal,
              year: metadataObj.year
            } : null,
            risContent: metadataObj ? metadataObj.risContent : null
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

    // Bersihkan timeout lama jika sesi sudah ada untuk menghindari penghapusan dini
    const existing = sessionStore.get(sessionId);
    if (existing && existing.timeoutId) {
      clearTimeout(existing.timeoutId);
    }

    // Jalankan timer untuk menghapus sesi otomatis setelah 1 jam
    const timeoutId = setTimeout(() => {
      sessionStore.delete(sessionId);
    }, SESSION_TTL_MS);

    // Simpan hasil konversi di store in-memory
    sessionStore.set(sessionId, {
      createdAt: existing ? existing.createdAt : Date.now(),
      files: results,
      timeoutId: timeoutId
    });

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
        errorMessage: f.errorMessage,
        hasMetadata: f.hasMetadata,
        metadata: f.metadata,
        risContent: f.risContent
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
    const { fileId, format } = req.query;

    const session = sessionStore.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Sesi unduhan tidak ditemukan atau telah kedaluwarsa!' });
    }

    // A. Penanganan Download Format RIS (Kutipan Mendeley/Zotero)
    if (format === 'ris') {
      if (fileId) {
        // Satuan
        const file = session.files.find(f => f.id === fileId);
        if (!file) {
          return res.status(404).json({ error: 'File tidak ditemukan!' });
        }
        if (!file.risContent) {
          return res.status(400).json({ error: 'Berkas ini tidak terdeteksi sebagai jurnal ilmiah (tidak memiliki sitasi RIS)!' });
        }

        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const formattedRis = file.risContent.replace(/\r?\n/g, '\r\n');
        res.setHeader('Content-Type', 'application/x-research-info-systems; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(baseName)}.ris"`);
        return res.send(formattedRis);
      } else {
        // Gabungan
        const filesWithRis = session.files.filter(f => f.status === 'SUCCESS' && f.risContent);
        if (filesWithRis.length === 0) {
          return res.status(400).json({ error: 'Tidak ada berkas yang terdeteksi sebagai jurnal ilmiah dengan sitasi RIS!' });
        }

        // Hubungkan setiap sitasi dengan baris kosong sesuai standar RIS
        const combinedRis = filesWithRis.map(f => {
          let content = f.risContent.trim();
          if (content.endsWith('ER  -')) {
            content += ' ';
          }
          return content;
        }).join('\n\n');
        const formattedCombinedRis = combinedRis.replace(/\r?\n/g, '\r\n') + '\r\n\r\n'; // Tambahkan trailing newline di akhir file sesuai standar RIS
        res.setHeader('Content-Type', 'application/x-research-info-systems; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="citations.ris"');
        return res.send(formattedCombinedRis);
      }
    }

    // B. Penanganan Download File Satuan (.md) jika ?fileId=... disediakan
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
