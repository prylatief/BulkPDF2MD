import React from 'react';
import { X, Sparkles, BookOpen, Coins, Target, Scissors, FileCode, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function GuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleClose = () => {
    // Simpan status agar tidak muncul lagi otomatis saat reload berikutnya
    localStorage.setItem('hasSeenGuide', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
      />

      {/* Modal Card - Premium Liquid Glass */}
      <div className="relative bg-zinc-950/30 border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_80px_rgba(0,0,0,0.6),_0_0_45px_rgba(0,230,118,0.08)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 z-10 overflow-hidden flex flex-col max-h-[90vh] group">
        
        {/* Reflection Light Sweep Effect */}
        <div className="absolute inset-0 w-[800px] h-[800px] bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-[400px] -translate-y-[400px] rotate-45 pointer-events-none transition-all duration-1000 group-hover:translate-x-[500px] group-hover:translate-y-[500px]"></div>

        {/* Inner Micro-bevel reflection line */}
        <div className="absolute inset-[1px] rounded-2xl border border-white/5 pointer-events-none"></div>

        {/* Glow effect */}
        <div className="absolute -top-20 -left-20 w-52 h-52 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Tombol Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5 shrink-0 border-b border-zinc-900 pb-4 pr-8">
          <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] font-extrabold tracking-widest text-emerald-400 uppercase font-mono bg-emerald-950/20 border border-emerald-900/30 px-2 py-0.5 rounded-full inline-block mb-1">
              PANDUAN ALUR AI
            </span>
            <h3 className="text-base md:text-lg font-extrabold text-zinc-100 tracking-wide font-sans uppercase">
              Kenapa convert PDF ke Markdown sebelum kasih ke AI?
            </h3>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
          
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Mengunggah file PDF mentah langsung ke ChatGPT, Claude, atau DeepSeek sering kali kurang optimal. Berikut alasan ilmiah kenapa mengonversi PDF ke Markdown (MD) terlebih dahulu menggunakan **BulkPDF2MD** akan melipatgandakan performa kecerdasan AI:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 text-xs">
            {/* Keunggulan 1 */}
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Coins className="w-4 h-4" />
                <span>1. Hemat Token</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                PDF mentah—terutama yang berbasis gambar—makan token jauh lebih banyak. MD = teks bersih, hampir 1:1 dengan konten aktual.
              </p>
            </div>

            {/* Keunggulan 2 */}
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Target className="w-4 h-4" />
                <span>2. AI Lebih Fokus</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Teks terstruktur = AI tidak perlu buang konteks window untuk decode layout, kolom, atau header PDF yang berantakan.
              </p>
            </div>

            {/* Keunggulan 3 */}
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Scissors className="w-4 h-4" />
                <span>3. Mudah di-chunk</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Mau tanya cuma soal metodologi? Copy bagian itu saja. PDF tidak bisa dipotong-potong sebersih ini tanpa tools khusus.
              </p>
            </div>

            {/* Keunggulan 4 */}
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <FileCode className="w-4 h-4" />
                <span>4. Bisa Dianotasi</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Tambah catatan, hapus bagian tidak relevan, atau highlight section penting langsung di file sebelum kasih ke AI.
              </p>
            </div>

            {/* Keunggulan 5 */}
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>5. Batch Friendly</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Punya 10 jurnal? Feed 10 MD sekaligus jauh lebih manageable dibanding 10 PDF yang masing-masing beda struktur.
              </p>
            </div>

            {/* Keunggulan 6 */}
            <div className="p-3 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>6. Reproducible</span>
              </div>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Input MD stabil dan identik setiap kali. PDF bisa beda renderingnya tergantung tool—bikin hasil AI tidak konsisten.
              </p>
            </div>
          </div>

          {/* Catatan Jujur */}
          <div className="p-3.5 bg-amber-950/20 border border-amber-900/30 rounded-xl flex items-start space-x-3 text-xs shrink-0 mt-2">
            <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-semibold text-amber-400 font-mono">CATATAN JUJUR DEVELOPER</h5>
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                Kalau PDF-nya hasil scan (image-only) atau penuh tabel statistik kompleks, hasil MD bisa tidak sempurna. Untuk jurnal akademik standar dengan teks biasa, ini bekerja sangat baik.
              </p>
            </div>
          </div>
        </div>

        {/* Tombol OK */}
        <button
          onClick={handleClose}
          className="w-full mt-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0"
        >
          Saya Paham, Mulai Konversi PDF!
        </button>
      </div>
    </div>
  );
}
