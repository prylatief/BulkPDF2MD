const crypto = require('crypto');
const { parsePdfToMarkdown } = require('../services/pdfService');
const { parseDocxToMarkdown } = require('../services/docxService');
const { processMetadata } = require('../services/metadataService');
const { createZipArchive } = require('../services/zipService');

/**
 * Endpoint POST /api/convert (Stateless)
 * Mengunggah banyak file PDF/Word sekaligus, memprosesnya secara asinkron, dan langsung mengembalikan hasilnya.
 */
async function convertBulkPdf(req, res) {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Tidak ada file PDF atau Word yang diunggah!' });
    }

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

    // Kirim rekap hasil konversi ke frontend secara langsung
    return res.json({
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
 * Endpoint POST /api/download/zip (Stateless)
 * Mengunduh file ZIP dari daftar file yang dikirimkan di request body.
 */
async function downloadZipStateless(req, res) {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'Tidak ada daftar file yang dikirimkan untuk dibuatkan ZIP!' });
    }

    const zipFilesList = files.map(f => ({
      filename: f.filename,
      content: f.content
    }));

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="BulkPDF2MD-Converted.zip"');

    // Alirkan ZIP ke response stream secara langsung
    await createZipArchive(zipFilesList, res);

  } catch (error) {
    console.error('Error pada endpoint download zip:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Gagal membuat file ZIP unduhan!' });
    }
  }
}

module.exports = {
  convertBulkPdf,
  downloadZipStateless
};
