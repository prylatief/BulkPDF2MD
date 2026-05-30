require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { uploadBulk } = require('./middlewares/uploadMiddleware');
const { convertBulkPdf, downloadConvertedFiles } = require('./controllers/convertController');

const app = express();
const PORT = process.env.PORT || 5000;

// Konfigurasi CORS agar frontend React (Vite) bisa mengakses backend
app.use(cors({
  origin: '*', // Di produksi, ganti dengan domain frontend tertentu
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Endpoint Tes Koneksi
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'BulkPDF2MD API Server berjalan dengan lancar!' });
});

// Endpoint Utama
app.post('/api/convert', uploadBulk, convertBulkPdf);
app.get('/api/download/:id', downloadConvertedFiles);

// Error Handling Global
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    const limit = process.env.MAX_FILE_SIZE || '10MB';
    return res.status(400).json({ error: `Ukuran file melebihi batas maksimal (${(parseInt(limit) / 1024 / 1024).toFixed(0)}MB)!` });
  }

  res.status(500).json({ 
    error: err.message || 'Terjadi kesalahan sistem internal pada backend!'
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` BulkPDF2MD Backend Server is running on port ${PORT} `);
  console.log(` Health Check: http://localhost:${PORT}/api/health    `);
  console.log(`====================================================`);
});
