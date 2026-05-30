const archiver = require('archiver');

/**
 * Membuat file ZIP secara dinamis dari array teks Markdown dan mengalirkannya langsung ke res.
 * @param {Array<{filename: string, content: string}>} files - Array berisi objek nama file dan konten markdown
 * @param {Object} writeStream - Stream output (biasanya Express Response `res`)
 * @returns {Promise<void>}
 */
function createZipArchive(files, writeStream) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 } // Kompresi tingkat maksimum
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.on('end', () => {
      resolve();
    });

    // Pipa arsip langsung ke stream response
    archive.pipe(writeStream);

    // Tambahkan setiap file ke dalam arsip ZIP
    files.forEach((file) => {
      archive.append(file.content, { name: file.filename });
    });

    // Selesaikan arsip
    archive.finalize();
  });
}

module.exports = {
  createZipArchive
};
