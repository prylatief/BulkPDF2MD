import React from 'react';
import { X, HelpCircle, UploadCloud, Cpu, Download, Shield } from 'lucide-react';

export default function HowItWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-[#0b0c13] border border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200 z-10 overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-zinc-100 tracking-wide font-sans uppercase">
            Cara Kerja BulkPDF2MD
          </h3>
        </div>

        {/* Alur Langkah */}
        <div className="space-y-4 font-sans">
          
          {/* Langkah 1 */}
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-zinc-900/30 border border-zinc-900">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 font-bold font-mono text-sm shrink-0">
              1
            </div>
            <div className="space-y-1">
              <h4 className="text-zinc-200 font-semibold text-sm flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                Unggah File PDF
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Tarik-dan-lepas (drag & drop) atau pilih berkas PDF dari komputer Anda. Batas maksimal per-file adalah 10MB dengan antrean maksimal 20 file.
              </p>
            </div>
          </div>

          {/* Langkah 2 */}
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-zinc-900/30 border border-zinc-900">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 font-bold font-mono text-sm shrink-0">
              2
            </div>
            <div className="space-y-1">
              <h4 className="text-zinc-200 font-semibold text-sm flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Ekstraksi & Formatting Teks
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Sistem asinkronus backend akan mengekstrak teks asli dan memformatnya secara cerdas ke dalam struktur Markdown bersih (.md) seperti heading, list, dan paragraf.
              </p>
            </div>
          </div>

          {/* Langkah 3 */}
          <div className="flex items-start space-x-4 p-3 rounded-lg bg-zinc-900/30 border border-zinc-900">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/30 font-bold font-mono text-sm shrink-0">
              3
            </div>
            <div className="space-y-1">
              <h4 className="text-zinc-200 font-semibold text-sm flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-400" />
                Tinjau & Unduh Hasil
              </h4>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Lihat pratinjau (preview) dokumen Markdown yang dilengkapi nomor baris. Unduh secara satuan atau sekaligus dalam satu file ZIP.
              </p>
            </div>
          </div>
        </div>

        {/* Keamanan & Kebijakan Data */}
        <div className="mt-5 p-3.5 bg-emerald-950/20 border border-emerald-900/20 rounded-xl flex items-start space-x-3 text-xs">
          <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-semibold text-emerald-400">100% Kebijakan Tanpa Disk (Zero Disk Write)</h5>
            <p className="text-zinc-400 leading-relaxed">
              Berkas Anda diproses sepenuhnya di dalam RAM server sementara dan langsung dialirkan secara streaming ke browser Anda. Tidak ada data yang disimpan di harddisk fisik kami, menjamin privasi penuh.
            </p>
          </div>
        </div>

        {/* Tombol Ok */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 font-bold text-xs transition-colors border border-zinc-800"
        >
          Mengerti, Tutup Panduan
        </button>
      </div>
    </div>
  );
}
