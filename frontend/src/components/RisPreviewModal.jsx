import React, { useState, useEffect } from 'react';
import { X, Copy, Check, FileText, Download, Edit2, Save, Trash2, Plus } from 'lucide-react';

export default function RisPreviewModal({ isOpen, onClose, file, onDownloadSingle, onSaveMetadata }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // States for form inputs
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState([]);
  const [journal, setJournal] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [year, setYear] = useState('');
  const [doi, setDoi] = useState('');
  
  // Real-time generated RIS preview state
  const [liveRis, setLiveRis] = useState('');

  const isCombined = !file || !file.id;

  // Initialize fields on open or file change
  useEffect(() => {
    if (isOpen && file) {
      setIsEditing(false);
      
      const ris = file.risContent || '';
      
      // Parse fields directly from RIS content for accuracy and compatibility
      setTitle(parseRisField(ris, 'TI') || (file.metadata && file.metadata.title) || '');
      setAuthors(parseRisAuthors(ris) || (file.metadata && file.metadata.authors) || []);
      setJournal(parseRisField(ris, 'JO') || parseRisField(ris, 'T2') || (file.metadata && file.metadata.journal) || '');
      setVolume(parseRisField(ris, 'VL') || '');
      setIssue(parseRisField(ris, 'IS') || '');
      setPages(parseRisField(ris, 'SP') || '');
      setYear(parseRisField(ris, 'PY') || parseRisField(ris, 'DA') || (file.metadata && file.metadata.year) || '');
      setDoi(parseRisField(ris, 'DO') || (file.metadata && file.metadata.doi) || '');
      
      setLiveRis(ris);
    }
  }, [isOpen, file]);

  // Regenerate RIS when fields change
  useEffect(() => {
    if (isEditing) {
      const generated = generateRisClient({
        title,
        authors,
        journal,
        volume,
        issue,
        pages,
        year,
        doi
      });
      setLiveRis(generated);
    }
  }, [title, authors, journal, volume, issue, pages, year, doi, isEditing]);

  const parseRisField = (risText, tag) => {
    if (!risText) return '';
    const regex = new RegExp(`^${tag}\\s+-\\s+(.*)$`, 'm');
    const match = risText.match(regex);
    return match ? match[1].trim() : '';
  };

  const parseRisAuthors = (risText) => {
    if (!risText) return [];
    const lines = risText.split('\n');
    const list = [];
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('AU  -')) {
        list.push(cleanLine.replace(/^AU\s+-\s+/, '').trim());
      }
    });
    return list;
  };

  const generateRisClient = ({ title, authors, journal, volume, issue, pages, year, doi }) => {
    const lines = [];
    lines.push('TY  - JOUR');

    // Penulis
    if (authors && Array.isArray(authors)) {
      authors.forEach((auth) => {
        if (auth.trim()) {
          lines.push(`AU  - ${auth.trim()}`);
        }
      });
    }

    // Judul
    if (title) {
      lines.push(`TI  - ${title.trim()}`);
    }

    // Jurnal
    if (journal) {
      lines.push(`JO  - ${journal.trim()}`);
      lines.push(`T2  - ${journal.trim()}`);
    }

    // Volume
    if (volume) {
      lines.push(`VL  - ${volume.trim()}`);
    }

    // Issue
    if (issue) {
      lines.push(`IS  - ${issue.trim()}`);
    }

    // Halaman
    if (pages) {
      lines.push(`SP  - ${pages.trim()}`);
    }

    // Tahun
    if (year) {
      lines.push(`PY  - ${year.trim()}`);
      lines.push(`DA  - ${year.trim()}`);
    }

    // DOI & URL
    if (doi) {
      lines.push(`DO  - ${doi.trim()}`);
      lines.push(`UR  - https://doi.org/${doi.trim()}`);
      lines.push(`UR  - http://dx.doi.org/${doi.trim()}`);
    }

    // End Record (ER)
    lines.push('ER  - ');

    return lines.join('\n');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(liveRis || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (onDownloadSingle) {
      // Buat file object bayangan yang menggunakan liveRis hasil edit
      onDownloadSingle({
        ...file,
        risContent: liveRis
      }, 'ris');
    }
  };

  const handleSave = () => {
    if (onSaveMetadata && file) {
      const cleanAuthors = authors.map(a => a.trim()).filter(Boolean);
      const updatedMetadata = {
        title: title.trim(),
        authors: cleanAuthors,
        journal: journal.trim(),
        year: year.toString().trim(),
        doi: doi.trim()
      };
      onSaveMetadata(file.id, updatedMetadata, liveRis);
      setIsEditing(false);
    }
  };

  // Author List Handlers
  const handleAuthorChange = (index, value) => {
    const updated = [...authors];
    updated[index] = value;
    setAuthors(updated);
  };

  const handleAddAuthor = () => {
    setAuthors([...authors, '']);
  };

  const handleRemoveAuthor = (index) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-[0_0_50px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200 z-10 flex flex-col max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-350 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-zinc-900 shrink-0">
          <div className="p-2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/30">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-md font-bold text-zinc-150 uppercase tracking-wide">
              {isEditing ? 'Edit Metadata Kutipan' : 'Sitasi RIS Mendeley / Zotero'}
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono truncate max-w-[320px] sm:max-w-md">
              {file.name}
            </p>
          </div>
        </div>

        {/* Content Area (Scrollable if editing) */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 min-h-0">
          {isEditing ? (
            /* ================= EDIT MODE FORM ================= */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Judul Artikel */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Judul Artikel</label>
                <textarea
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                  placeholder="Masukkan judul artikel..."
                />
              </div>

              {/* Jurnal */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Nama Jurnal</label>
                <input
                  type="text"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Nama jurnal ilmiah..."
                />
              </div>

              {/* DOI */}
              <div className="space-y-1.5">
                <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">DOI</label>
                <input
                  type="text"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  placeholder="10.xxxx/xxxx"
                />
              </div>

              {/* Metadata Grid */}
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Tahun</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    placeholder="YYYY"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Volume</label>
                  <input
                    type="text"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    placeholder="Vol."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Issue</label>
                  <input
                    type="text"
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    placeholder="No."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Halaman</label>
                  <input
                    type="text"
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    placeholder="Hal. (misal 95-104)"
                  />
                </div>
              </div>

              {/* Daftar Penulis */}
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-zinc-400 font-semibold uppercase tracking-wider text-[10px]">Penulis (Format: Belakang, Depan)</label>
                  <button
                    onClick={handleAddAuthor}
                    className="flex items-center space-x-1 py-1 px-2.5 bg-emerald-950/45 hover:bg-emerald-950 border border-emerald-900/50 text-emerald-400 rounded text-[10px] font-bold transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Penulis</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {authors.length === 0 ? (
                    <p className="text-zinc-600 text-xs italic">Belum ada penulis terdaftar.</p>
                  ) : (
                    authors.map((auth, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={auth}
                          onChange={(e) => handleAuthorChange(index, e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded text-zinc-200 focus:outline-none focus:border-emerald-500 transition-colors"
                          placeholder="Contoh: Smith, John"
                        />
                        <button
                          onClick={() => handleRemoveAuthor(index)}
                          className="p-2 rounded bg-zinc-950 hover:bg-rose-950/20 border border-zinc-900 hover:border-rose-900 text-zinc-500 hover:text-rose-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ================= PREVIEW MODE DETAIL ================= */
            file.metadata && (
              <div className="bg-zinc-900/40 border border-zinc-900 rounded p-3.5 text-xs text-zinc-400 space-y-1 shrink-0">
                <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Title:</span> <span className="text-zinc-200 font-medium">{title}</span></div>
                {authors && authors.length > 0 && (
                  <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Authors:</span> <span className="text-zinc-200">{authors.join('; ')}</span></div>
                )}
                {journal && (
                  <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Journal:</span> <span className="text-zinc-200">{journal}</span></div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {year && (
                    <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Year:</span> <span className="text-zinc-200">{year}</span></div>
                  )}
                  {volume && (
                    <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Volume:</span> <span className="text-zinc-200">{volume}</span></div>
                  )}
                  {issue && (
                    <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Issue:</span> <span className="text-zinc-200">{issue}</span></div>
                  )}
                  {pages && (
                    <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">Pages:</span> <span className="text-zinc-200">{pages}</span></div>
                  )}
                </div>
                {doi && (
                  <div className="truncate"><span className="text-zinc-500 font-semibold font-mono">DOI:</span> <span className="text-zinc-350 font-mono select-all">{doi}</span></div>
                )}
              </div>
            )
          )}

          {/* RIS Code Output (Realtime Preview) */}
          <div className="bg-zinc-950/80 border border-zinc-900 rounded-lg overflow-hidden flex flex-col min-h-[150px]">
            <div className="flex items-center justify-between px-3 py-2 bg-zinc-900/40 border-b border-zinc-900 text-[10px] text-zinc-500 font-mono font-semibold shrink-0">
              <span>{isEditing ? 'LIVE RIS CODE PREVIEW' : 'RIS FORMAT DATA'}</span>
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
            <pre className="flex-1 p-3.5 overflow-y-auto text-[11px] font-mono text-zinc-350 whitespace-pre bg-zinc-950/20 max-h-[20vh] min-h-[120px]">
              {liveRis || 'Tidak ada data kutipan.'}
            </pre>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-900 shrink-0">
          <div>
            {!isCombined && (
              isEditing ? (
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-1.5 py-2 px-4 rounded bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-bold transition-all text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Metadata</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1.5 py-2 px-4 rounded border border-zinc-850 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-850 text-zinc-350 hover:text-zinc-150 transition-all text-xs"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit Metadata</span>
                </button>
              )
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={isEditing ? () => setIsEditing(false) : onClose}
              className="px-4 py-2 rounded border border-zinc-850 hover:border-zinc-700 bg-zinc-950 text-zinc-400 hover:text-zinc-200 transition-colors text-xs"
            >
              {isEditing ? 'Batal' : 'Tutup'}
            </button>
            {!isEditing && (
              <button
                onClick={handleDownload}
                className="flex items-center space-x-2 py-2 px-4 rounded bg-emerald-500 hover:bg-emerald-450 text-zinc-950 font-bold transition-all text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download .RIS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
