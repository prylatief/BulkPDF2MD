const fs = require('fs');
const path = require('path');

// Cari archiver dari backend/node_modules jika belum terinstal di root
let archiver;
try {
  archiver = require('archiver');
} catch (err) {
  try {
    const backendArchiverPath = path.join(__dirname, 'backend', 'node_modules', 'archiver');
    archiver = require(backendArchiverPath);
  } catch (innerErr) {
    console.error('\n❌ Error: Paket "archiver" tidak ditemukan!');
    console.log('Silakan jalankan "npm install" di folder backend terlebih dahulu sebelum menjalankan script ini.\n');
    process.exit(1);
  }
}

const outputZipPath = path.join(__dirname, 'BulkPDF2MD.zip');
const output = fs.createWriteStream(outputZipPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // Kompresi maksimum
});

output.on('close', function() {
  console.log(`\n====================================================`);
  console.log(`🎉 Berhasil membundel project BulkPDF2MD!`);
  console.log(`📦 File output: ${outputZipPath}`);
  console.log(`💾 Ukuran file: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`====================================================\n`);
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Tambahkan berkas di root
archive.file('README.md', { name: 'README.md' });
archive.file('SYSTEM_MAP.md', { name: 'SYSTEM_MAP.md' });

// Fungsi rekursif untuk menambahkan direktori secara selektif (abaikan node_modules, dist, .git, dll.)
function addDirectoryToArchive(srcDir, destDir) {
  const items = fs.readdirSync(srcDir);

  items.forEach((item) => {
    const fullPath = path.join(srcDir, item);
    const relativePath = path.join(destDir, item);

    // Filter folder-folder yang tidak perlu masuk ke ZIP
    if (
      item === 'node_modules' || 
      item === 'dist' || 
      item === '.git' || 
      item === 'BulkPDF2MD.zip' || 
      item === '.env'
    ) {
      return;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      archive.directory(fullPath, relativePath);
    } else {
      archive.file(fullPath, { name: relativePath });
    }
  });
}

console.log('Sedang memproses dan mengompres file...');
addDirectoryToArchive(path.join(__dirname, 'backend'), 'backend');
addDirectoryToArchive(path.join(__dirname, 'frontend'), 'frontend');

archive.finalize();
