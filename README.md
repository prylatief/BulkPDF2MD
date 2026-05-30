# BulkPDF2MD — Bulk PDF to Markdown Converter

BulkPDF2MD adalah aplikasi web berkinerja tinggi, privat, dan aman untuk mengonversi banyak file PDF sekaligus menjadi format Markdown (.md) secara dinamis. Aplikasi ini mengusung desain antarmuka modern bertema dark-green cyberpunk yang responsif dan interaktif.

## Fitur Utama
- **Upload Massal (Bulk Upload)**: Mendukung seret-dan-lepas (drag & drop) atau pemilih file standar untuk banyak file sekaligus.
- **Indikator Kemajuan Real-time**: Menampilkan status antrean, persentase progress, keberhasilan, atau jenis kesalahan secara visual per-file.
- **Markdown Split-view Preview**: Tinjau hasil konversi Markdown di panel editor lengkap dengan nomor baris sebelum diunduh, lengkap dengan fitur salin clipboard satu klik dan mode layar penuh (fullscreen).
- **Fleksibilitas Unduhan**: Unduh seluruh hasil konversi sekaligus dalam satu file ZIP atau unduh file `.md` satuan secara mandiri.
- **Deteksi Cerdas (Smart Handling)**: Penanganan otomatis untuk mendeteksi PDF terenkripsi (password-protected) dan PDF kosong (hasil scan/gambar).
- **Stateless & RAM Buffer**: Tidak menulis file sementara ke dalam penyimpanan disk fisik server, menjaga privasi data Anda 100% aman secara lokal.

---

## Struktur Folder Project
```text
BulkPDF2MD/
├── backend/          # Express API server & PDF parsers
├── frontend/         # React SPA (Vite + Tailwind CSS)
├── README.md         # Panduan instalasi dan penggunaan
└── zip-project.js    # Script pembuat bundle zip otomatis
```

---

## Cara Menjalankan Project Secara Lokal

Pastikan Anda telah menginstal **Node.js** (versi 16 atau lebih baru) di komputer Anda.

### Langkah 1: Jalankan Backend Server
1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Instal dependensi backend:
   ```bash
   npm install
   ```
3. Mulai server backend dalam mode production atau development:
   ```bash
   # Mode Development (dengan auto-restart nodemon)
   npm run dev

   # ATAU Jalankan server langsung
   npm start
   ```
   Server backend akan aktif di `http://localhost:5000` dan siap menerima permintaan.

---

### Langkah 2: Jalankan Frontend App (React)
1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Instal dependensi frontend:
   ```bash
   npm install
   ```
3. Jalankan server development Vite:
   ```bash
   npm run dev
   ```
4. Buka tautan yang muncul di terminal (biasanya `http://localhost:3000`) di browser Anda.

---

## Konfigurasi Environment (`backend/.env`)
Anda dapat mengubah preferensi batas ukuran file dengan mengedit file `.env` di dalam folder `backend`:
- `PORT`: Port server backend (Default: `5000`)
- `MAX_FILE_SIZE`: Batas maksimal ukuran per-file PDF dalam bytes (Default: `10485760` / 10MB)
- `MAX_FILE_COUNT`: Batas maksimal jumlah file PDF sekali unggah (Default: `20`)
