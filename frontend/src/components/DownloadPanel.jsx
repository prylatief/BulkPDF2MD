import React, { useState } from 'react';
import { CheckCircle, Download, Eye, Copy, Trash2, ArrowLeft, AlertTriangle, FileText, Check } from 'lucide-react';

export default function DownloadPanel({ files, sessionId, onBackToUpload, onClearAll, onPreviewFile, onDownloadSingle, onDownloadZip, onViewRis, API_BASE }) {
  const [copiedFileId, setCopiedFileId] = useState(null);

  const successfulFiles = files.filter(f => f.status === 'SUCCESS');
  const errorFiles = files.filter(f => f.status === 'ERROR');

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    const k = 1024;
    return (bytes / k).toFixed(1) + ' KB';
  };

  // Hitung estimasi ukuran ZIP (akumulasi ukuran file markdown hasil konversi + sedikit overhead)
  const totalZipSizeBytes = successfulFiles.reduce((acc, f) => acc + (f.sizeMdBytes || 0), 0);
  const formattedZipSize = totalZipSizeBytes > 0 ? formatSize(totalZipSizeBytes * 0.9) : '0 KB'; // Estimasi kompresi ZIP 90%

  const handleCopyText = (file) => {
    navigator.clipboard.writeText(file.markdown || '');
    setCopiedFileId(file.id);
    setTimeout(() => setCopiedFileId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner Ringkasan Konversi */}
      <div className="flex flex-col md:flex-row items-center justify-between p-6 bg-zinc-900/40 border border-zinc-800 rounded-xl gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-emerald-950/40 text-emerald-400 border border-emerald-900/50">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">
              CONVERSION COMPLETED
            </h3>
            <p className="text-zinc-400 text-sm mt-0.5">
              {successfulFiles.length} dari {files.length} file sukses dikonversi menjadi Markdown.
            </p>
          </div>
        </div>

        {successfulFiles.length > 0 && (
          <div className="flex flex-col gap-3 w-full md:w-auto items-stretch md:items-end">
            <button
              onClick={onDownloadZip}
              className="flex items-center justify-center space-x-2 py-3 px-6 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 transition-all font-bold shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] text-sm"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download All ({successfulFiles.length}) as ZIP</span>
            </button>
            
            {files.some(f => f.status === 'SUCCESS' && f.risContent) && (
              <button
                onClick={() => {
                  window.location.href = `${API_BASE}/download/${sessionId}?format=ris`;
                }}
                className="flex items-center justify-center space-x-2 py-2.5 px-6 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-emerald-400 hover:text-emerald-350 transition-all font-bold text-xs"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Combined RIS for Mendeley</span>
              </button>
            )}
            
            <p className="text-[11px] text-zinc-500 font-mono mt-1 uppercase tracking-wider text-center md:text-right">
              Estimasi ukuran ZIP: {formattedZipSize}
            </p>
          </div>
        )}
      </div>

      {/* Tabel File Rekapitulasi */}
      <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 text-[10px] text-zinc-500 font-bold uppercase tracking-wider border-b border-zinc-800">
                <th className="py-4 px-5">File Name</th>
                <th className="py-4 px-4 text-center">Pages</th>
                <th className="py-4 px-4 text-center">Size (MD)</th>
                <th className="py-4 px-4 text-center">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-sm">
              {files.map((file) => (
                <tr 
                  key={file.id} 
                  className={`hover:bg-zinc-900/30 transition-colors
                    ${file.status === 'ERROR' ? 'text-zinc-500' : 'text-zinc-200'}`}
                >
                  {/* File Name */}
                  <td className="py-4 px-5 font-medium max-w-[280px] md:max-w-md truncate">
                    <div className="flex items-center space-x-3">
                      <FileText className={`w-4 h-4 shrink-0
                        ${file.status === 'ERROR' ? 'text-rose-500/50' : 'text-emerald-500/80'}`}
                      />
                      <span className="truncate tracking-wide">{file.name}</span>
                    </div>
                  </td>

                  {/* Pages */}
                  <td className="py-4 px-4 text-center font-mono text-zinc-400">
                    {file.status === 'SUCCESS' ? file.pages : '0'}
                  </td>

                  {/* Size (MD) */}
                  <td className="py-4 px-4 text-center font-mono text-zinc-400">
                    {file.status === 'SUCCESS' ? formatSize(file.sizeMdBytes) : '—'}
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className={`inline-block text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded border
                        ${file.status === 'SUCCESS'
                          ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/40'
                          : 'text-rose-500 bg-rose-950/20 border-rose-900/40'
                        }`}
                      >
                        {file.status}
                      </span>
                      {file.status === 'ERROR' && (
                        <span className="text-[10px] text-rose-450 mt-1 font-sans">
                          {file.errorType === 'SCAN_ONLY' ? 'Scan-only (No Text)' :
                           file.errorType === 'ENCRYPTED' ? 'Password Protected' : 
                           file.errorMessage || 'Failed'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    {file.status === 'SUCCESS' ? (
                      <div className="flex items-center justify-end space-x-1">
                        {file.hasMetadata && onViewRis && (
                          <>
                            <button
                              onClick={() => onViewRis(file)}
                              title="View RIS Citation"
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDownloadSingle(file, 'ris')}
                              title="Download RIS Citation File"
                              className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors"
                            >
                              <Download className="w-4 h-4 text-emerald-500/80" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onPreviewFile(file)}
                          title="Preview Markdown"
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDownloadSingle(file)}
                          title="Download Markdown File"
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyText(file)}
                          title="Copy Markdown Text"
                          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors"
                        >
                          {copiedFileId === file.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="text-zinc-600 text-xs italic pr-2 select-none">
                        Not available
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block md:hidden divide-y divide-zinc-850">
          {files.map((file) => (
            <div key={file.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <FileText className={`w-4 h-4 shrink-0
                    ${file.status === 'ERROR' ? 'text-rose-500/50' : 'text-emerald-500/80'}`}
                  />
                  <span className="truncate text-zinc-200 text-sm font-medium tracking-wide">{file.name}</span>
                </div>
                <span className={`inline-block text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded border shrink-0
                  ${file.status === 'SUCCESS'
                    ? 'text-emerald-400 bg-emerald-950/20 border-emerald-900/40'
                    : 'text-rose-500 bg-rose-950/20 border-rose-900/40'
                  }`}
                >
                  {file.status}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                <div>Pages: <span className="text-zinc-200">{file.status === 'SUCCESS' ? file.pages : '0'}</span></div>
                <div>Size: <span className="text-zinc-200">{file.status === 'SUCCESS' ? formatSize(file.sizeMdBytes) : '—'}</span></div>
              </div>

              {file.status === 'ERROR' && (
                <div className="text-[11px] text-rose-450 bg-rose-950/20 border border-rose-900/40 p-2 rounded">
                  {file.errorType === 'SCAN_ONLY' ? 'Scan-only (No Text)' :
                   file.errorType === 'ENCRYPTED' ? 'Password Protected' : 
                   file.errorMessage || 'Failed'}
                </div>
              )}

              {file.status === 'SUCCESS' && (
                <div className="flex flex-wrap items-center justify-end gap-1.5 pt-2 border-t border-zinc-850/50">
                  {file.hasMetadata && onViewRis && (
                    <>
                      <button
                        onClick={() => onViewRis(file)}
                        className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors text-[11px]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View RIS</span>
                      </button>
                      <button
                        onClick={() => onDownloadSingle(file, 'ris')}
                        className="flex items-center space-x-1 px-2 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-450 transition-colors text-[11px]"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-500/80" />
                        <span>RIS</span>
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onPreviewFile(file)}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors text-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => onDownloadSingle(file)}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleCopyText(file)}
                    className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors text-xs"
                  >
                    {copiedFileId === file.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tombol Kontrol Bawah */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBackToUpload}
          className="flex items-center space-x-2 py-2 px-4 rounded border border-zinc-850 hover:border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-zinc-200 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upload</span>
        </button>

        <button
          onClick={onClearAll}
          className="flex items-center space-x-2 py-2 px-4 rounded border border-rose-950/30 hover:border-rose-900/50 bg-rose-950/10 hover:bg-rose-950/20 text-rose-400 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear All Files</span>
        </button>
      </div>
    </div>
  );
}
