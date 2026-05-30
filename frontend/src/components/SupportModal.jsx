import React from 'react';
import { Coffee, Heart, X, CheckCircle, ExternalLink } from 'lucide-react';

export default function SupportModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop Glassmorphism */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card - Premium Liquid Glass */}
      <div className="relative bg-zinc-950/30 border border-white/10 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_80px_rgba(0,0,0,0.6),_0_0_40px_rgba(0,230,118,0.08)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 z-10 overflow-hidden group">
        
        {/* Reflection Light Sweep Effect */}
        <div className="absolute inset-0 w-[600px] h-[600px] bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-[300px] -translate-y-[300px] rotate-45 pointer-events-none transition-all duration-1000 group-hover:translate-x-[400px] group-hover:translate-y-[400px]"></div>
        
        {/* Inner Micro-bevel reflection line */}
        <div className="absolute inset-[1px] rounded-2xl border border-white/5 pointer-events-none"></div>

        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ikon Header */}
        <div className="flex justify-center space-x-3 mb-5 pt-3">
          <div className="p-3 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="p-3 rounded-full bg-amber-950/40 text-amber-500 border border-amber-900/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <Coffee className="w-6 h-6" />
          </div>
        </div>

        {/* Konten Utama */}
        <div className="space-y-3.5">
          <span className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase font-mono bg-emerald-950/30 border border-emerald-900/50 px-3 py-1 rounded-full inline-block">
            DOWNLOAD STARTED! 🎉
          </span>
          <h3 className="text-xl font-extrabold text-zinc-100 tracking-wide font-sans uppercase">
            SUPPORT THE DEVELOPER
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
            Aplikasi ini 100% gratis, privat, dan open-source. Jika alat ini mempermudah alur kerja Anda, pertimbangkan untuk mentraktir kopi pengembang untuk mendukung pembuatan alat-alat gratis lainnya! ☕
          </p>
        </div>

        {/* Pilihan Donasi/Dukungan */}
        <div className="mt-6 space-y-2.5">
          <a
            href="http://lynk.id/iktifadzatipry/7lx8190d7mkg/checkout" // Link Lynk.id checkout milik user
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-extrabold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]"
          >
            <Coffee className="w-4 h-4 fill-zinc-950 stroke-[2.5]" />
            <span>Traktir Kopi di Lynk.id</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="https://teer.id/prylatief" // Link Teer.id milik user
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-300 hover:text-zinc-100 font-bold text-sm transition-all"
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>Dukung via Teer.id</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
          </a>

          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs text-zinc-500 hover:text-zinc-400 font-mono tracking-wider transition-colors pt-2 uppercase"
          >
            Nanti Saja, Kembali ke Aplikasi
          </button>
        </div>

        {/* Footer Kecil */}
        <div className="mt-5 text-[10px] text-zinc-600 font-mono">
          Dukungan Anda sangat berarti bagi kelangsungan open-source.
        </div>
      </div>
    </div>
  );
}
