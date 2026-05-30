# SYSTEM_MAP.md — BulkPDF2MD

## 1. Project Summary
* **Tujuan**: Aplikasi web berbasis client-server untuk melakukan konversi massal (bulk) file PDF menjadi dokumen berformat Markdown (.md). Aplikasi menyediakan fitur preview hasil konversi dan unduhan langsung dalam bentuk arsip ZIP maupun file satuan.
* **Tech Stack**:
  * **Frontend**: React (Vite) + Tailwind CSS untuk antarmuka yang cepat dan responsif.
  * **Backend**: Node.js + Express untuk menangani upload, parsing, dan bundling.
  * **PDF Processing**: `pdf-parse` (lebih stabil untuk pemrosesan teks murni di sisi backend).
  * **MD Output**: Custom Parser / `turndown` untuk memformat teks hasil ekstraksi menjadi Markdown bersih.
  * **File Handling**: `multer` (penanganan upload file berbasis memori buffer) dan `archiver` (pembuatan file ZIP secara on-the-fly).
* **Pola Arsitektur**: decoupled Client-Server (monorepo structure) dengan pemrosesan stateless.

---

## 2. Core Logic Flow
Format: *Route/Trigger → Handler → Service → Output*

* **Bulk Conversion Route**:
  `POST /api/convert` → `uploadMiddleware` (Multer) → `convertController` → `pdfService` (Parsing & formatting) → `zipService` (Archiver) → `Response (ZIP stream)`

* **Single File Preview Route**:
  `POST /api/preview` → `uploadMiddleware` (Single file) → `convertController` → `pdfService` (Parsing & formatting) → `Response (JSON Preview)`

---

## 3. Feature List
* **Upload Multiple PDF**: Drag & drop zone intuitif serta file picker standar dengan dukungan seleksi banyak file sekaligus.
* **Progress Indicator**: Tampilan visual real-time status upload dan pemrosesan per file (Queue, Processing, Success, Error).
* **Markdown Preview**: Komponen panel/modal preview untuk melihat hasil konversi teks sebelum diunduh.
* **Flexible Download Options**:
  * Download bulk dalam format `.zip` berisi seluruh file `.md` yang sukses dikonversi.
  * Download file `.md` secara individual langsung dari daftar file.
* **Robust Error Handling**: Deteksi otomatis untuk PDF corrupt, PDF terenkripsi (password-protected), atau PDF kosong tanpa menghentikan proses konversi file lainnya.

---

## 4. Clean Tree
```text
BulkPDF2MD/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── convertController.js
│   │   ├── middlewares/
│   │   │   └── uploadMiddleware.js
│   │   ├── services/
│   │   │   ├── pdfService.js
│   │   │   └── zipService.js
│   │   └── app.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DropZone.jsx
│   │   │   ├── FileList.jsx
│   │   │   └── PreviewModal.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── SYSTEM_MAP.md
```

---

## 5. Module Map
* **`backend/src/app.js`**: Server entry point. Mengatur inisialisasi Express, CORS, routing, dan global error handler.
* **`backend/src/middlewares/uploadMiddleware.js`**: Konfigurasi `multer` untuk membatasi ukuran file, memvalidasi tipe mime PDF, dan memproses file via memori RAM buffer.
* **`backend/src/controllers/convertController.js`**: Controller utama untuk menerima file dari middleware, mengoordinasikan parsing, serta memicu response JSON preview atau ZIP stream.
* **`backend/src/services/pdfService.js`**: Berfungsi mengekstrak teks dari PDF menggunakan `pdf-parse` dan memformatnya menjadi Markdown standar (heading, paragraf, list).
* **`backend/src/services/zipService.js`**: Mengompresi kumpulan data teks Markdown yang berhasil dikonversi menjadi file ZIP menggunakan `archiver`.
* **`frontend/src/components/DropZone.jsx`**: Area drag & drop dengan feedback visual dinamis untuk menampung file PDF yang ditarik pengguna.
* **`frontend/src/components/FileList.jsx`**: Komponen visual daftar file yang diunggah lengkap dengan progress bar, status, preview trigger, dan tombol download satuan.
* **`frontend/src/components/PreviewModal.jsx`**: Modal overlay yang menampilkan konten Markdown hasil konversi dengan styling typography yang rapi.

---

## 6. Data & Config
* **Environment Variables (`.env`)**:
  * `PORT=5000` (Port untuk server backend)
  * `MAX_FILE_SIZE=10485760` (Batas maksimum ukuran per file PDF: 10MB)
  * `MAX_FILE_COUNT=20` (Batas jumlah file dalam sekali unggah)
* **Temp Storage Strategy**:
  * **Zero Disk Write Policy**: Aplikasi menggunakan `multer.memoryStorage()`. File PDF disimpan dalam memori RAM sementara selama proses parsing berlangsung.
  * **Direct Streaming**: Hasil kompresi ZIP langsung di-stream ke HTTP response (`archiver.pipe(res)`), sehingga server tidak menyimpan file ZIP fisik di disk lokal, mencegah kebocoran penyimpanan (disk bloat).

---

## 7. Risks / Blind Spots
* **PDF Terenkripsi (Password-Protected)**:
  * *Risiko*: Proses parsing akan melempar error enkripsi dan gagal total untuk file tersebut.
  * *Mitigasi*: Try-catch block spesifik pada `pdfService` untuk mendeteksi error enkripsi, menandai file tersebut sebagai "Terproteksi", dan melanjutkan proses file lainnya.
* **Scan-Only PDF (Image-Only)**:
  * *Risiko*: Hasil ekstraksi teks berupa string kosong karena tidak ada teks tersemat (perlu OCR).
  * *Mitigasi*: Jika teks hasil parsing kosong/sangat pendek tapi ukuran file besar, sistem mendeteksi dan memberi label peringatan "PDF hasil scan detected (No text found)" di UI. OCR berada di luar scope v1.
* **Memory Exhaustion (OOM)**:
  * *Risiko*: Upload banyak file berukuran besar sekaligus berpotensi membuat server kehabisan memori RAM.
  * *Mitigasi*: Pembatasan `MAX_FILE_SIZE` dan `MAX_FILE_COUNT` di level middleware, serta pemrosesan parsing file secara asinkronus berurutan (sequential) alih-alih paralel penuh (`Promise.all`) jika jumlah file melebihi ambang batas tertentu.
