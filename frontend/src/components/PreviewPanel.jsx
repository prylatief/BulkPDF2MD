import React, { useState } from 'react';
import { FileText, Copy, Maximize2, Minimize2, Download, ArrowLeft, Check, Terminal } from 'lucide-react';

export default function PreviewPanel({ file, onBack, onDownloadSingle }) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!file) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(file.markdown || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    return (bytes / k).toFixed(1) + ' KB';
  };

  // Generate baris angka untuk editor
  const markdownLines = (file.markdown || '').split('\n');

  return (
    <div className={`grid gap-6 transition-all duration-300 h-full
      ${isFullscreen ? 'fixed inset-4 z-50 bg-[#090a0f] border border-zinc-800 rounded-xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)]' : 'grid-cols-1 lg:grid-cols-4'}`}
    >
      {/* Panel Info Kiri (Sembunyikan atau kecilkan jika fullscreen) */}
      {!isFullscreen && (
        <div className="lg:col-span-1 flex flex-col justify-between bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-5 h-full">
          <div className="space-y-6">
            <h3 className="font-semibold text-zinc-400 tracking-wide text-xs uppercase">
              FILE INFO
            </h3>

            {/* Main File Card */}
            <div className="flex items-start space-x-3 p-3 rounded bg-zinc-900/60 border border-zinc-800">
              <div className="p-2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-zinc-200 text-sm font-semibold truncate tracking-wide">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  {formatSize(file.size)} • {file.pages} pages
                </p>
              </div>
            </div>

            {/* Status & Specs */}
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">
                  STATUS
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
                  SUCCESS
                </span>
                <p className="text-xs text-zinc-400 mt-1">Converted to Markdown</p>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">
                  PAGES
                </span>
                <span className="text-lg font-semibold text-zinc-200 font-mono">
                  {file.pages}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">
                  SIZE (MD)
                </span>
                <span className="text-lg font-semibold text-zinc-200 font-mono">
                  {formatSize(file.sizeMdBytes)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-0.5">
                  CONVERTED AT
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })} {new Date().toLocaleTimeString('en-US', { hour12: false })}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-6 border-t border-zinc-800/40">
            <button
              onClick={() => onDownloadSingle(file)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-all font-semibold text-sm shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              <Download className="w-4 h-4" />
              <span>Download .md</span>
            </button>

            <button
              onClick={onBack}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded border border-zinc-800 hover:border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-zinc-200 transition-all text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to list</span>
            </button>
          </div>
        </div>
      )}

      {/* Editor/Preview Kanan */}
      <div className={`flex flex-col bg-[#0b0c13] border border-zinc-800/80 rounded-xl overflow-hidden h-full
        ${isFullscreen ? 'w-full' : 'lg:col-span-3'}`}
      >
        {/* Editor Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2 text-zinc-400 text-xs font-semibold">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>MARKDOWN PREVIEW</span>
            {isFullscreen && (
              <span className="text-zinc-600 font-normal">| {file.name}</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs transition-all border
                ${copied 
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {isFullscreen && (
              <button
                onClick={onBack}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs bg-rose-950/20 border border-rose-900/30 text-rose-400 hover:bg-rose-950/40 transition-colors"
              >
                <span>Close</span>
              </button>
            )}
          </div>
        </div>

        {/* Editor Body dengan Line Numbers */}
        <div className="flex-1 flex overflow-hidden font-mono text-[13px] leading-relaxed">
          {/* Baris Angka */}
          <div className="py-4 select-none text-right text-zinc-700 border-r border-zinc-900 bg-zinc-950/40 w-12 pr-3.5">
            {markdownLines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>

          {/* Area Konten Teks */}
          <div className="flex-1 p-4 overflow-y-auto bg-zinc-950/20 text-zinc-300 whitespace-pre-wrap select-text selection:bg-emerald-500/20 select-all">
            {file.markdown || (
              <span className="text-zinc-650 italic">Tidak ada konten teks hasil konversi.</span>
            )}
          </div>
        </div>

        {/* Editor Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-t border-zinc-800/80 text-[11px] text-zinc-500 font-mono">
          <div className="flex items-center space-x-4">
            <span>{file.pages} pages converted</span>
            <span>•</span>
            <span>{formatSize(file.sizeMdBytes)}</span>
          </div>
          <div>
            <span className="px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 font-bold uppercase tracking-wider text-[9px]">
              Markdown
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
