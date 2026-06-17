import React, { useState, useEffect } from 'react';
import { X, Clock, FileText, Trash2, Download, Copy, Check, Eye } from 'lucide-react';

export default function HistoryModal({ isOpen, onClose, onPreviewFile, onDownloadSingle }) {
  const [history, setHistory] = useState([]);
  const [copiedFileId, setCopiedFileId] = useState(null);

  // Load history when modal opens
  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const historyStr = localStorage.getItem('conversionHistory') || '[]';
      setHistory(JSON.parse(historyStr));
    } catch (e) {
      console.error('Failed to load history:', e);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat konversi?')) {
      try {
        localStorage.removeItem('conversionHistory');
        setHistory([]);
      } catch (e) {
        console.error('Failed to clear history:', e);
      }
    }
  };

  const handleDeleteItem = (id, e) => {
    e.stopPropagation();
    try {
      const updated = history.filter(item => item.id !== id);
      localStorage.setItem('conversionHistory', JSON.stringify(updated));
      setHistory(updated);
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleCopyText = (file, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.markdown || '');
    setCopiedFileId(file.id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  const handlePreview = (file, e) => {
    e.stopPropagation();
    if (onPreviewFile) {
      // Buat virtual file object yang kompatibel dengan PreviewPanel
      onPreviewFile({
        ...file,
        status: 'SUCCESS'
      });
      onClose(); // Tutup modal riwayat
    }
  };

  const handleDownload = (file, format, e) => {
    e.stopPropagation();
    if (onDownloadSingle) {
      onDownloadSingle(file, format);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 KB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card - Liquid Glass */}
      <div className="relative bg-zinc-950/40 border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-[0_0_80px_rgba(0,0,0,0.6),_0_0_40px_rgba(16,185,129,0.05)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200 z-10 overflow-hidden flex flex-col max-h-[85vh] group">
        
        {/* Reflection light beam */}
        <div className="absolute inset-0 w-[600px] h-[600px] bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-[300px] -translate-y-[300px] rotate-45 pointer-events-none transition-all duration-1000 group-hover:translate-x-[400px] group-hover:translate-y-[400px]"></div>
        
        {/* Inner Micro-bevel reflection line */}
        <div className="absolute inset-[1px] rounded-2xl border border-white/5 pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-zinc-900 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-900/40">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-md font-extrabold text-zinc-100 uppercase tracking-wide">
                Riwayat Konversi
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                Disimpan secara lokal di browser Anda ({history.length} file)
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1 px-2.5 py-1 text-[10px] text-rose-500 hover:text-rose-450 border border-rose-950/40 bg-rose-950/10 hover:bg-rose-950/20 rounded transition-all font-semibold font-mono"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>HAPUS SEMUA</span>
            </button>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto min-h-[200px] pr-1 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="w-12 h-12 text-zinc-700 stroke-[1.5] mb-3" />
              <p className="text-zinc-500 text-sm font-medium">Belum ada riwayat konversi.</p>
              <p className="text-zinc-650 text-xs mt-1">Konversikan beberapa PDF atau Word untuk merekam di sini.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-900 hover:border-zinc-850 transition-all gap-4 group/item"
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <div className="p-2 rounded bg-zinc-950 border border-zinc-900 text-zinc-400 mt-0.5 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h4 className="text-zinc-200 hover:text-zinc-100 font-semibold text-xs truncate max-w-[320px] sm:max-w-md" title={item.name}>
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[10px] text-zinc-500 font-mono">
                      <span>{formatSize(item.size)}</span>
                      <span>•</span>
                      <span>{item.pages} Hal</span>
                      <span>•</span>
                      <span>{formatTime(item.timestamp)}</span>
                      {item.hasMetadata && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-500 font-bold uppercase tracking-wider text-[9px] bg-emerald-950/30 px-1 border border-emerald-900/30 rounded">RIS</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={(e) => handlePreview(item, e)}
                    title="Pratinjau Markdown"
                    className="p-1.5 rounded bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleCopyText(item, e)}
                    title="Salin Markdown"
                    className="p-1.5 rounded bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                  >
                    {copiedFileId === item.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={(e) => handleDownload(item, 'md', e)}
                    title="Unduh Markdown (.md)"
                    className="p-1.5 rounded bg-zinc-950 border border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {item.risContent && (
                    <button
                      onClick={(e) => handleDownload(item, 'ris', e)}
                      title="Unduh Sitasi RIS (.ris)"
                      className="p-1.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 hover:text-zinc-950 hover:bg-emerald-400 transition-all"
                    >
                      <span className="text-[9px] font-bold font-mono">RIS</span>
                    </button>
                  )}
                  <div className="h-4 w-px bg-zinc-800 mx-1"></div>
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    title="Hapus dari Riwayat"
                    className="p-1.5 rounded bg-zinc-950 border border-zinc-900 text-zinc-650 hover:text-rose-500 hover:bg-rose-950/20 hover:border-rose-950/50 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-zinc-900 shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 font-bold text-xs transition-colors border border-zinc-800"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
