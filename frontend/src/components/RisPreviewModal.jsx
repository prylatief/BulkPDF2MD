import React, { useState } from 'react';
import { X, Copy, Check, FileText, Download } from 'lucide-react';

export default function RisPreviewModal({ isOpen, onClose, file, onDownloadSingle }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !file) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(file.risContent || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onDownloadSingle) {
      onDownloadSingle(file, 'ris');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl max-w-lg w-full p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-10 flex flex-col max-h-[85vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-350 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-zinc-900">
          <div className="p-2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-md font-bold text-zinc-150 uppercase tracking-wide">
              Sitasi RIS Mendeley / Zotero
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono truncate max-w-[320px] sm:max-w-md">
              {file.name}
            </p>
          </div>
        </div>

        {/* Info Detail */}
        {file.metadata && (
          <div className="bg-zinc-900/40 border border-zinc-900 rounded p-3 text-xs text-zinc-400 mb-4 space-y-1">
            <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Title:</span> <span className="text-zinc-200">{file.metadata.title}</span></div>
            {file.metadata.authors && file.metadata.authors.length > 0 && (
              <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Authors:</span> <span className="text-zinc-200">{file.metadata.authors.join('; ')}</span></div>
            )}
            {file.metadata.journal && (
              <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Journal:</span> <span className="text-zinc-200">{file.metadata.journal}</span></div>
            )}
            {file.metadata.doi && (
              <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">DOI:</span> <span className="text-zinc-350 font-mono select-all">{file.metadata.doi}</span></div>
            )}
          </div>
        )}

        {/* RIS Code Output */}
        <div className="flex-1 bg-zinc-950/80 border border-zinc-900 rounded-lg overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/40 border-b border-zinc-900 text-[10px] text-zinc-500 font-mono font-semibold">
            <span>RIS FORMAT DATA</span>
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 hover:text-zinc-350 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="flex-1 p-3.5 overflow-y-auto text-[11px] font-mono text-zinc-350 whitespace-pre bg-zinc-950/20 max-h-[30vh]">
            {file.risContent || 'Tidak ada data sitasi.'}
          </pre>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-end space-x-3 mt-5 pt-3 border-t border-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-zinc-850 hover:border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-zinc-200 transition-colors text-xs"
          >
            Tutup
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-2 py-2 px-4 rounded bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-bold transition-all text-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .RIS</span>
          </button>
        </div>
      </div>
    </div>
  );
}
