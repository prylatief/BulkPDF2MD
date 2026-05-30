import React from 'react';
import { FileText, Eye, Download, X, AlertTriangle, RefreshCw, Clock } from 'lucide-react';

export default function FileList({ files, onRemoveFile, onPreviewFile, onDownloadSingle, onRetryFile }) {
  // Format ukuran byte ke string KB/MB
  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const dm = 1;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper warna badge status
  const getStatusBadge = (file) => {
    switch (file.status) {
      case 'PROCESSING':
        return (
          <span className="text-[10px] font-bold tracking-wider text-blue-400 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/50 animate-pulse">
            PROCESSING
          </span>
        );
      case 'QUEUED':
        return (
          <span className="text-[10px] font-bold tracking-wider text-yellow-500 bg-yellow-950/20 px-2 py-0.5 rounded border border-yellow-900/30">
            QUEUED
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="text-[10px] font-bold tracking-wider text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
            SUCCESS
          </span>
        );
      case 'ERROR':
        return (
          <span className="text-[10px] font-bold tracking-wider text-rose-500 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50">
            ERROR
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-5 overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/50">
        <h3 className="font-semibold text-zinc-300 tracking-wide text-sm">
          FILES ({files.length})
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pt-4 pr-1">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-2">
            <FileText className="w-10 h-10 text-zinc-700 stroke-[1.5]" />
            <p className="text-zinc-500 text-sm">Belum ada file yang diunggah.</p>
          </div>
        ) : (
          files.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700/60 transition-all duration-200"
            >
              {/* Info Kiri */}
              <div className="flex items-center space-x-3.5 min-w-0 flex-1 mr-4">
                <div className={`p-2 rounded bg-zinc-950/80 border
                  ${file.status === 'ERROR' ? 'border-rose-900/30 text-rose-400' : ''}
                  ${file.status === 'SUCCESS' ? 'border-emerald-900/30 text-emerald-400' : ''}
                  ${file.status === 'PROCESSING' || file.status === 'QUEUED' ? 'border-blue-900/30 text-blue-400' : ''}
                  ${!file.status ? 'border-zinc-800 text-zinc-400' : ''}`}
                >
                  <FileText className="w-5 h-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-zinc-200 text-sm font-medium truncate tracking-wide">
                    {file.name}
                  </p>
                  <div className="flex items-center space-x-2.5 mt-1">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {formatSize(file.size)}
                    </span>
                    {file.status === 'PROCESSING' && (
                      <span className="text-[11px] text-blue-400 font-mono">
                        {file.progress}%
                      </span>
                    )}
                    {file.status === 'QUEUED' && (
                      <span className="text-[11px] text-yellow-500/80 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" /> Waiting...
                      </span>
                    )}
                    {file.status === 'ERROR' && (
                      <span className="text-[11px] text-rose-400 truncate max-w-[200px] flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 inline" />
                        {file.errorType === 'SCAN_ONLY' ? 'Scan-only (No text)' : 
                         file.errorType === 'ENCRYPTED' ? 'Password protected' : 
                         file.errorMessage || 'Gagal mengekstrak'}
                      </span>
                    )}
                  </div>

                  {/* Progress Bar untuk file yang sedang diproses */}
                  {file.status === 'PROCESSING' && (
                    <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden mt-2.5 border border-zinc-850">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Aksi Kanan */}
              <div className="flex items-center space-x-2">
                {getStatusBadge(file)}

                {/* Tombol Aksi berdasarkan status */}
                {file.status === 'SUCCESS' && (
                  <>
                    <button
                      onClick={() => onPreviewFile(file)}
                      title="Preview Markdown"
                      className="p-1.5 rounded hover:bg-zinc-850 text-zinc-400 hover:text-emerald-400 transition-colors"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => onDownloadSingle(file)}
                      title="Download Markdown"
                      className="p-1.5 rounded hover:bg-zinc-850 text-zinc-400 hover:text-emerald-400 transition-colors"
                    >
                      <Download className="w-4.5 h-4.5" />
                    </button>
                  </>
                )}

                {file.status === 'ERROR' && onRetryFile && (
                  <button
                    onClick={() => onRetryFile(file)}
                    title="Retry Conversion"
                    className="p-1.5 rounded hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-colors animate-spin-hover"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                {(file.status === 'PROCESSING' || file.status === 'QUEUED' || file.status === 'SUCCESS' || file.status === 'ERROR') && (
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    title="Remove File"
                    className="p-1.5 rounded hover:bg-zinc-850 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
