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

  // Judul (Title)
  const title = (item.title && item.title[0]) || defaultTitle;
  lines.push(`TI  - ${title}`);

  // Penulis (Authors)
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

  // Nama Jurnal (Journal Name)
  const journal = (item['container-title'] && item['container-title'][0]) || '';
  if (journal) {
    lines.push(`JO  - ${journal}`);
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
    const pages = item.page.split('-');
    if (pages[0]) lines.push(`SP  - ${pages[0]}`);
    if (pages[1]) lines.push(`EP  - ${pages[1]}`);
  }

  // DOI
  if (item.DOI) {
    lines.push(`DO  - ${item.DOI}`);
    lines.push(`UR  - https://doi.org/10.xxxx/xxxx`.replace('10.xxxx/xxxx', item.DOI));
  } else if (item.URL) {
    lines.push(`UR  - ${item.URL}`);
  }

  // End Record
  lines.push('ER  - ');

  return lines.join('\n');
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
    const fallbackItem = {
      title: [defaultTitle],
      DOI: doi,
      URL: `https://doi.org/${doi}`
    };
    return {
      doi: doi,
      title: defaultTitle,
      authors: [],
      journal: '',
      year: '',
      risContent: generateRis(fallbackItem, defaultTitle)
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
