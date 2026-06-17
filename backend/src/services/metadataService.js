const https = require('https');

// Regex untuk mendeteksi DOI (case insensitive)
const DOI_REGEX = /\b(10\.\d{4,9}\/[-._;()/:A-Z0-9]+)\b/i;

/**
 * Mencari DOI dalam teks kasar.
 * @param {string} text - Teks lengkap berkas
 * @returns {string|null} - DOI jika ditemukan, null jika tidak.
 */
function extractDoi(text) {
  if (!text) return null;
  // Cari di 8000 karakter pertama agar lebih cepat dan relevan (DOI biasanya di halaman pertama)
  const sample = text.substring(0, 8000);
  const match = sample.match(DOI_REGEX);
  return match ? match[1] : null;
}

/**
 * Mengambil metadata resmi dari CrossRef API berdasarkan DOI.
 * @param {string} doi - DOI artikel
 * @returns {Promise<object|null>} - Metadata resmi dari CrossRef
 */
function fetchCrossRefMetadata(doi) {
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'BulkPDF2MD/1.0 (mailto:prylatief@example.com)'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            if (parsed && parsed.message) {
              resolve(parsed.message);
              return;
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => {
      resolve(null);
    });
  });
}

/**
 * Membuat teks format RIS berdasarkan metadata CrossRef.
 * @param {object} item - Objek metadata CrossRef
 * @param {string} defaultTitle - Judul cadangan jika kosong
 * @returns {string} - Konten dalam format RIS
 */
function generateRis(item, defaultTitle = 'Untitled Article') {
  const lines = [];
  lines.push('TY  - JOUR');

  // Penulis (Authors) - diletakkan di atas sesuai format web pembanding
  if (item.author && Array.isArray(item.author)) {
    item.author.forEach((auth) => {
      if (auth.family && auth.given) {
        lines.push(`AU  - ${auth.family}, ${auth.given}`);
      } else if (auth.family) {
        lines.push(`AU  - ${auth.family}`);
      } else if (auth.name) {
        lines.push(`AU  - ${auth.name}`);
      }
    });
  }

  // Judul (Title)
  const title = (item.title && item.title[0]) || defaultTitle;
  lines.push(`TI  - ${title}`);

  // Nama Jurnal (Journal Name) - output T2 dan JO untuk kompatibilitas penuh
  const journal = (item['container-title'] && item['container-title'][0]) || '';
  if (journal) {
    lines.push(`JO  - ${journal}`);
    lines.push(`T2  - ${journal}`);
  }

  // Volume
  if (item.volume) {
    lines.push(`VL  - ${item.volume}`);
  }

  // Issue
  if (item.issue) {
    lines.push(`IS  - ${item.issue}`);
  }

  // Halaman (Pages)
  if (item.page) {
    lines.push(`SP  - ${item.page}`);
  }

  // Tahun Terbit (Publication Year)
  let year = '';
  if (item['published-print'] && item['published-print']['date-parts']) {
    year = item['published-print']['date-parts'][0][0];
  } else if (item['published-online'] && item['published-online']['date-parts']) {
    year = item['published-online']['date-parts'][0][0];
  } else if (item.created && item.created['date-parts']) {
    year = item.created['date-parts'][0][0];
  }
  
  if (year) {
    lines.push(`PY  - ${year}`);
    lines.push(`DA  - ${year}`);
  }

  // DOI & URL (Dual URL untuk kompatibilitas Mendeley)
  if (item.DOI) {
    lines.push(`DO  - ${item.DOI}`);
    lines.push(`UR  - https://doi.org/${item.DOI}`);
    lines.push(`UR  - http://dx.doi.org/${item.DOI}`);
  } else if (item.URL) {
    lines.push(`UR  - ${item.URL}`);
  }

  // End Record
  lines.push('ER  - ');

  return lines.join('\n');
}

/**
 * Ekstraksi judul dan penulis secara heuristik dari bagian atas teks jika CrossRef API gagal/404.
 * @param {string} text - Teks lengkap artikel
 * @param {string} defaultTitle - Nama file/judul default
 * @returns {{title: string, authors: string[]}}
 */
function extractHeuristicMetadata(text, defaultTitle) {
  if (!text) return { title: defaultTitle, authors: [] };
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  // Kata kunci penanda metadata/header jurnal yang harus diabaikan saat mencari judul
  const ignoreKeywords = [
    'jurnal', 'volume', 'issn', 'doi', 'website', 'e-issn', 'p-issn', 
    'http', 'page', 'nomor', 'no.', 'vol.', 'download', ' Nusantara', 'Menulis'
  ];

  let title = '';
  let authors = [];
  let titleIndex = -1;

  // 1. Cari Baris Judul
  for (let i = 0; i < Math.min(lines.length, 15); i++) {
    const line = lines[i];
    // Periksa apakah baris ini berisi kata kunci header jurnal
    const isHeaderLine = ignoreKeywords.some(kw => line.toLowerCase().includes(kw.toLowerCase()));
    
    // Jika tidak mengandung keyword sampah, panjangnya mencukupi (misal > 15 karakter), dan bukan berupa email/afiliasi
    if (!isHeaderLine && line.length > 15 && line.length < 200 && !line.includes('@')) {
      title = line;
      titleIndex = i;
      break;
    }
  }

  // Jika tidak ketemu judul yang bagus, pakai defaultTitle
  if (!title) {
    title = defaultTitle;
  }

  // 2. Cari Baris Penulis (biasanya berada tepat di bawah baris judul)
  if (titleIndex !== -1 && titleIndex + 1 < lines.length) {
    let potentialAuthorsLine = lines[titleIndex + 1];
    
    // Kadang baris penulis dipisah koma atau mengandung nama-nama tanpa email
    // Kita filter jika barisnya bukan afiliasi (seperti Universitas, Jurusan, dll)
    const isAffiliation = ['universitas', 'institute', 'school', 'faculty', 'jurusan', 'program studi', 'dept', 'departemen', 'email'].some(kw => potentialAuthorsLine.toLowerCase().includes(kw));
    
    if (!isAffiliation && potentialAuthorsLine.length > 3 && potentialAuthorsLine.length < 150) {
      // Hilangkan superscript angka penanda afiliasi (contoh: Rofiqotul1, Zahra2 -> Rofiqotul, Zahra)
      const cleanLine = potentialAuthorsLine.replace(/\b\d\b/g, '').replace(/[*†‡]/g, '').trim();
      authors = cleanLine.split(/, | dan | & /).map(name => name.trim()).filter(name => name.length > 2);
    }
  }

  return {
    title: title,
    authors: authors
  };
}

/**
 * Memproses teks lengkap untuk dideteksi sebagai artikel ilmiah dan menghasilkan RIS.
 * @param {string} text - Teks artikel lengkap
 * @param {string} defaultTitle - Nama file/judul cadangan
 * @returns {Promise<object|null>} - Objek metadata dan sitasi RIS
 */
async function processMetadata(text, defaultTitle) {
  const doi = extractDoi(text);
  if (!doi) return null;

  const metadata = await fetchCrossRefMetadata(doi);
  if (!metadata) {
    // Fallback jika API gagal tetapi DOI ditemukan
    // Jalankan parser heuristik dari teks untuk mengisi judul dan penulis
    const heuristics = extractHeuristicMetadata(text, defaultTitle);
    
    const fallbackItem = {
      title: [heuristics.title],
      DOI: doi,
      URL: `https://doi.org/${doi}`,
      author: heuristics.authors.map(name => ({ name }))
    };
    return {
      doi: doi,
      title: heuristics.title,
      authors: heuristics.authors,
      journal: '',
      year: '',
      risContent: generateRis(fallbackItem, heuristics.title)
    };
  }

  const title = (metadata.title && metadata.title[0]) || defaultTitle;
  const journal = (metadata['container-title'] && metadata['container-title'][0]) || '';
  
  let year = '';
  if (metadata['published-print'] && metadata['published-print']['date-parts']) {
    year = metadata['published-print']['date-parts'][0][0];
  } else if (metadata['published-online'] && metadata['published-online']['date-parts']) {
    year = metadata['published-online']['date-parts'][0][0];
  }

  const authors = (metadata.author || []).map(auth => {
    if (auth.family && auth.given) return `${auth.family}, ${auth.given}`;
    return auth.family || auth.name || '';
  }).filter(Boolean);

  return {
    doi: doi,
    title: title,
    authors: authors,
    journal: journal,
    year: year,
    risContent: generateRis(metadata, defaultTitle)
  };
}

module.exports = {
  extractDoi,
  processMetadata
};
