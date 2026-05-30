import React, { useState } from 'react';
import { X, Settings, ShieldAlert, Check, Palette, Cpu } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, accentColor, onChangeAccent, processingMode, onChangeProcessingMode, autoClear, onChangeAutoClear }) {

  if (!isOpen) return null;

  const themes = [
    { id: 'emerald', name: 'Cyber Green', color: 'bg-emerald-500', border: 'border-emerald-500' },
    { id: 'blue', name: 'Neon Blue', color: 'bg-blue-500', border: 'border-blue-500' },
    { id: 'purple', name: 'Cyber Purple', color: 'bg-purple-500', border: 'border-purple-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card - Premium Liquid Glass */}
      <div className="relative bg-zinc-950/30 border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-[0_0_80px_rgba(0,0,0,0.6),_0_0_40px_rgba(0,230,118,0.08)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 z-10 overflow-hidden group">
        
        {/* Reflection Light Sweep Effect */}
        <div className="absolute inset-0 w-[600px] h-[600px] bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-[300px] -translate-y-[300px] rotate-45 pointer-events-none transition-all duration-1000 group-hover:translate-x-[400px] group-hover:translate-y-[400px]"></div>

        {/* Inner Micro-bevel reflection line */}
        <div className="absolute inset-[1px] rounded-2xl border border-white/5 pointer-events-none"></div>

        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-zinc-900 text-zinc-400 border border-zinc-800">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-extrabold text-zinc-100 tracking-wide font-sans uppercase">
            Pengaturan Aplikasi
          </h3>
        </div>

        {/* Form Isi Pengaturan */}
        <div className="space-y-5 font-sans">
          
          {/* Opsi 1: Pilihan Tema Warna Aksen */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-zinc-400" />
              Warna Aksen Tema
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onChangeAccent(t.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-lg border bg-zinc-950/60 hover:bg-zinc-900/60 transition-all text-xs
                    ${accentColor === t.id 
                      ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-zinc-200' 
                      : 'border-zinc-850 text-zinc-450 hover:text-zinc-300'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full ${t.color} mb-1.5`}></div>
                  <span className="font-mono text-[10px]">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Opsi 2: Mode Pemrosesan Antrean */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-400" />
              Mode Pemrosesan PDF
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onChangeProcessingMode('sequential')}
                className={`py-2 px-3 rounded-lg border text-xs text-center transition-all font-mono
                  ${processingMode === 'sequential'
                    ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-bold'
                    : 'bg-zinc-950/40 border-zinc-850 text-zinc-450 hover:text-zinc-355'
                  }`}
              >
                Sequential (Aman)
              </button>
              <button
                onClick={() => onChangeProcessingMode('parallel')}
                className={`py-2 px-3 rounded-lg border text-xs text-center transition-all font-mono
                  ${processingMode === 'parallel'
                    ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-bold'
                    : 'bg-zinc-950/40 border-zinc-850 text-zinc-450 hover:text-zinc-355'
                  }`}
              >
                Parallel (Cepat)
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed font-sans mt-1">
              * Mode *Sequential* memproses berkas satu per satu agar RAM server tetap stabil.
            </p>
          </div>

          {/* Opsi 3: Auto Clear Queue */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/40 border border-zinc-900">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-zinc-200 block">
                Bersihkan Antrean Otomatis
              </label>
              <span className="text-[10px] text-zinc-500 block">
                Menghapus file dari daftar setelah ZIP diunduh
              </span>
            </div>
            <button
              onClick={() => onChangeAutoClear(!autoClear)}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none
                ${autoClear ? 'bg-emerald-500' : 'bg-zinc-800'}`}
            >
              <div 
                className={`w-4 h-4 rounded-full bg-zinc-950 transition-transform duration-200 transform
                  ${autoClear ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Opsi 4: Info Batasan Server */}
          <div className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-1.5 text-xs text-zinc-400">
            <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wider block">
              Batasan API Server saat ini
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>• Max Ukuran: <span className="text-zinc-350">10 MB / PDF</span></div>
              <div>• Max Berkas: <span className="text-zinc-350">20 / Unggahan</span></div>
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)]"
        >
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
