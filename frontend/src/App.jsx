import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, Zap, Code, LayoutGrid, Settings, 
  ArrowRight, FileSpreadsheet, RefreshCw, Upload, Eye, HelpCircle, Terminal, Clock
} from 'lucide-react';
import DropZone from './components/DropZone';
import FileList from './components/FileList';
import PreviewPanel from './components/PreviewPanel';
import DownloadPanel from './components/DownloadPanel';
import SupportModal from './components/SupportModal';
import HowItWorksModal from './components/HowItWorksModal';
import SettingsModal from './components/SettingsModal';
import GuideModal from './components/GuideModal';
import RisPreviewModal from './components/RisPreviewModal';
import HistoryModal from './components/HistoryModal';

// Konfigurasi endpoint API relatif untuk Serverless Vercel (satu domain) dan Development Local Proxy
const API_BASE = '/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload', 'preview', 'download'
  const [files, setFiles] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('emerald'); // 'emerald', 'blue', 'purple'
  const [processingMode, setProcessingMode] = useState('sequential'); // 'sequential', 'parallel'
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [autoClear, setAutoClear] = useState(false);
  const [risPreviewFile, setRisPreviewFile] = useState(null);
  const [isRisPreviewOpen, setIsRisPreviewOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Efek memicu popup panduan otomatis jika user baru pertama kali membuka website
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      setIsGuideOpen(true);
    }
  }, []);

  // Status Summary Grid (untuk di sidebar upload)
  const totalCount = files.length;
  const queuedCount = files.filter(f => f.status === 'QUEUED').length;
  const processingCount = files.filter(f => f.status === 'PROCESSING').length;
  const doneCount = files.filter(f => f.status === 'SUCCESS').length;
  const errorCount = files.filter(f => f.status === 'ERROR').length;

  // Handle seleksi berkas dari DropZone
  const handleFilesSelected = (newFiles) => {
    // Bangun objek file dengan status awal
    const formattedFiles = newFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 9),
      name: file.name,
      size: file.size,
      rawFile: file,
      status: 'QUEUED',
      progress: 0,
      pages: 0,
      markdown: '',
      sizeMdBytes: 0
    }));

    setFiles(prev => [...prev, ...formattedFiles]);
    setActiveTab('upload');
  };

  // Memicu proses konversi ketika ada file baru berstatus QUEUED
  useEffect(() => {
    const nextQueuedFile = files.find(f => f.status === 'QUEUED');
    if (nextQueuedFile && !isProcessing) {
      processFileConversion(nextQueuedFile);
    }
  }, [files, isProcessing]);

  // Menyimpan riwayat konversi ke localStorage
  const saveToLocalHistory = (file) => {
    try {
      const historyStr = localStorage.getItem('conversionHistory') || '[]';
      const history = JSON.parse(historyStr);
      
      const filtered = history.filter(h => h.name !== file.name);
      
      const newItem = {
        id: file.id,
        name: file.name,
        size: file.size,
        pages: file.pages,
        markdown: file.markdown,
        sizeMdBytes: file.sizeMdBytes,
        hasMetadata: file.hasMetadata,
        metadata: file.metadata,
        risContent: file.risContent,
        timestamp: Date.now()
      };
      
      filtered.unshift(newItem);
      if (filtered.length > 50) {
        filtered.pop();
      }
      
      localStorage.setItem('conversionHistory', JSON.stringify(filtered));
    } catch (err) {
      console.error('Failed to save local history:', err);
    }
  };

  // Fungsi Pemrosesan Upload & Konversi ke Backend
  const processFileConversion = async (fileToProcess) => {
    setIsProcessing(true);

    // 1. Ubah status file menjadi PROCESSING
    setFiles(prev => prev.map(f => 
      f.id === fileToProcess.id ? { ...f, status: 'PROCESSING', progress: 5 } : f
    ));

    // Simulasikan progress bar visual yang halus (cocok untuk localhost yang super cepat)
    let progressInterval = setInterval(() => {
      setFiles(prev => prev.map(f => {
        if (f.id === fileToProcess.id && f.progress < 90) {
          return { ...f, progress: f.progress + Math.floor(Math.random() * 15) + 5 };
        }
        return f;
      }));
    }, 150);

    try {
      // 2. Buat FormData dan panggil API Backend
      const formData = new FormData();
      formData.append('files', fileToProcess.rawFile);

      const response = await fetch(`${API_BASE}/convert`, {
        method: 'POST',
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal mengonversi file.');
      }

      const result = await response.json();
      const processedFile = result.files[0];

      // 3. Update status berkas sukses atau gagal berdasarkan respons backend
      setFiles(prev => prev.map(f => {
        if (f.id === fileToProcess.id) {
          const updated = {
            ...f,
            id: processedFile.id, // Sinkronisasikan ID client-side dengan UUID unik backend
            status: processedFile.status,
            progress: 100,
            pages: processedFile.pages || 1,
            markdown: processedFile.markdown || '',
            sizeMdBytes: processedFile.sizeMdBytes || 0,
            errorType: processedFile.errorType,
            errorMessage: processedFile.errorMessage,
            hasMetadata: processedFile.hasMetadata,
            metadata: processedFile.metadata,
            risContent: processedFile.risContent
          };

          if (updated.status === 'SUCCESS') {
            saveToLocalHistory(updated);
          }
          return updated;
        }
        return f;
      }));

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Conversion Error:', error);
      
      setFiles(prev => prev.map(f => {
        if (f.id === fileToProcess.id) {
          return {
            ...f,
            status: 'ERROR',
            progress: 0,
            errorMessage: error.message || 'Koneksi API Gagal'
          };
        }
        return f;
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  // Unduh zip massal dari backend secara stateless
  const handleDownloadZip = async () => {
    const successfulFiles = files.filter(f => f.status === 'SUCCESS');
    if (successfulFiles.length === 0) return;

    try {
      const response = await fetch(`${API_BASE}/download/zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: successfulFiles.map(f => ({
            filename: f.mdFilename,
            content: f.markdown
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Gagal mengunduh ZIP');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'BulkPDF2MD-Converted.zip';
      link.click();
      URL.revokeObjectURL(url);

      // Picu kemunculan pop-up traktir kopi
      setIsSupportOpen(true);

      // Jika auto-clear aktif, bersihkan seluruh antrean setelah 1.5 detik
      if (autoClear) {
        setTimeout(() => {
          handleClearAll();
        }, 1500);
      }
    } catch (err) {
      console.error('ZIP download error:', err);
      alert('Gagal mengunduh file ZIP!');
    }
  };

  // Unduh berkas markdown atau RIS secara langsung di browser (client-side)
  const handleDownloadSingle = (file, format = 'md') => {
    const isRis = format === 'ris';
    const content = isRis ? (file.risContent || '') : file.markdown;
    const mime = isRis ? 'application/x-research-info-systems;charset=utf-8' : 'text/markdown;charset=utf-8';
    const ext = isRis ? '.ris' : '.md';

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    link.download = `${baseName}${ext}`;
    link.click();
    URL.revokeObjectURL(url);

    // Picu kemunculan pop-up traktir kopi
    setIsSupportOpen(true);
  };

  // Menyimpan perubahan metadata hasil edit visual ke state & localStorage history
  const handleSaveMetadata = (fileId, updatedMetadata, updatedRisContent) => {
    // 1. Update status file aktif di antrean
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        // Jika file sedang di-preview, update juga objek preview-nya agar perubahannya langsung tergambar di layar preview
        if (previewFile && previewFile.id === fileId) {
          setPreviewFile(prevPreview => ({
            ...prevPreview,
            metadata: updatedMetadata,
            risContent: updatedRisContent
          }));
        }
        // Jika file sedang dibuka pratinjau RIS-nya, update juga agar modal tahu perubahannya
        if (risPreviewFile && risPreviewFile.id === fileId) {
          setRisPreviewFile(prevRis => ({
            ...prevRis,
            metadata: updatedMetadata,
            risContent: updatedRisContent
          }));
        }
        return {
          ...f,
          metadata: updatedMetadata,
          risContent: updatedRisContent
        };
      }
      return f;
    }));

    // 2. Update riwayat konversi di localStorage
    try {
      const historyStr = localStorage.getItem('conversionHistory') || '[]';
      const history = JSON.parse(historyStr);
      const updatedHistory = history.map(item => {
        if (item.id === fileId) {
          return {
            ...item,
            metadata: updatedMetadata,
            risContent: updatedRisContent
          };
        }
        return item;
      });
      localStorage.setItem('conversionHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      console.error('Failed to update local history with new metadata:', err);
    }
  };

  const handlePreviewFile = (file) => {
    setPreviewFile(file);
    setActiveTab('preview');
  };

  const handleRemoveFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (previewFile && previewFile.id === id) {
      setPreviewFile(null);
      setActiveTab('upload');
    }
  };

  const handleRetryFile = (file) => {
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, status: 'QUEUED', progress: 0 } : f
    ));
  };

  const handleClearAll = () => {
    setFiles([]);
    setPreviewFile(null);
    setActiveTab('upload');
  };

  const t = {
    emerald: {
      text: 'text-emerald-400',
      text300: 'text-emerald-300',
      bg: 'bg-emerald-500',
      bgHover: 'hover:bg-emerald-400',
      border: 'border-emerald-500',
      borderMuted: 'border-emerald-900/40',
      borderMuted30: 'border-emerald-900/30',
      borderMuted50: 'border-emerald-900/50',
      bgMuted: 'bg-emerald-950/40',
      bgMuted30: 'bg-emerald-950/30',
      selectionBg: 'selection:bg-emerald-500/20',
      selectionText: 'selection:text-emerald-300',
      shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      shadow10: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
      shadow20: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
      glowBg: 'bg-emerald-500/5',
      activeTab: 'text-emerald-400 border-b-2 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
    },
    blue: {
      text: 'text-blue-400',
      text300: 'text-blue-300',
      bg: 'bg-blue-500',
      bgHover: 'hover:bg-blue-400',
      border: 'border-blue-500',
      borderMuted: 'border-blue-900/40',
      borderMuted30: 'border-blue-900/30',
      borderMuted50: 'border-blue-900/50',
      bgMuted: 'bg-blue-950/40',
      bgMuted30: 'bg-blue-950/30',
      selectionBg: 'selection:bg-blue-500/20',
      selectionText: 'selection:text-blue-300',
      shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
      shadow10: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]',
      shadow20: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]',
      glowBg: 'bg-blue-500/5',
      activeTab: 'text-blue-400 border-b-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.05)]'
    },
    purple: {
      text: 'text-purple-400',
      text300: 'text-purple-300',
      bg: 'bg-purple-500',
      bgHover: 'hover:bg-purple-400',
      border: 'border-purple-500',
      borderMuted: 'border-purple-900/40',
      borderMuted30: 'border-purple-900/30',
      borderMuted50: 'border-purple-900/50',
      bgMuted: 'bg-purple-950/40',
      bgMuted30: 'bg-purple-950/30',
      selectionBg: 'selection:bg-purple-500/20',
      selectionText: 'selection:text-purple-300',
      shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]',
      shadow10: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]',
      shadow20: 'shadow-[0_0_15px_rgba(168,85,247,0.2)]',
      glowBg: 'bg-purple-500/5',
      activeTab: 'text-purple-400 border-b-2 border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.05)]'
    }
  }[accentColor];

  return (
    <div className={`min-h-screen flex flex-col justify-between ${t.selectionBg} ${t.selectionText}`}>
      
      {/* Header Premium */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-4 py-4 md:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center space-x-3.5 cursor-pointer" onClick={handleClearAll}>
              <div className={`p-2 rounded-lg ${t.bgMuted} ${t.text} ${t.borderMuted} ${t.shadow}`}>
                <Terminal className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="font-extrabold text-zinc-100 tracking-wide text-lg font-mono">
                  BulkPDF<span className={t.text}>2MD</span>
                </span>
                <span className="text-[10px] text-zinc-500 font-mono block tracking-wider uppercase -mt-1">
                  v1.0.0 local
                </span>
              </div>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 md:hidden">
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="text-[10px] text-zinc-400 border border-zinc-800 bg-zinc-950 px-2 py-1.5 rounded font-medium hover:text-zinc-200 transition-colors"
              >
                Riwayat
              </button>
              <button 
                onClick={() => setIsHowItWorksOpen(true)}
                className="text-[10px] text-zinc-400 border border-zinc-800 bg-zinc-950 px-2 py-1.5 rounded font-medium hover:text-zinc-200 transition-colors"
              >
                Help
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 rounded bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigasi Tab */}
          {files.length > 0 && (
            <nav className="flex space-x-1.5 p-1 bg-zinc-900/60 border border-zinc-850 rounded-lg w-full md:w-auto justify-center">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all uppercase text-center
                  ${activeTab === 'upload' 
                    ? `bg-zinc-800 ${t.activeTab}` 
                    : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Upload
              </button>
              <button
                onClick={() => {
                  if (doneCount > 0) {
                    const firstSuccess = files.find(f => f.status === 'SUCCESS');
                    setPreviewFile(firstSuccess);
                    setActiveTab('preview');
                  }
                }}
                disabled={doneCount === 0}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all uppercase text-center disabled:opacity-40 disabled:cursor-not-allowed
                  ${activeTab === 'preview' 
                    ? `bg-zinc-800 ${t.activeTab}` 
                    : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab('download')}
                className={`flex-1 md:flex-none px-4 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-all uppercase text-center
                  ${activeTab === 'download' 
                    ? `bg-zinc-800 ${t.activeTab}` 
                    : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Download
              </button>
            </nav>
          )}

          {/* Ikon Kanan (Desktop) */}
          <div className="hidden md:flex items-center space-x-3.5">
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center space-x-1.5 text-xs text-zinc-400 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 px-3 py-1.5 rounded font-medium hover:text-zinc-200 transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Riwayat</span>
            </button>
            <button 
              onClick={() => setIsHowItWorksOpen(true)}
              className="text-xs text-zinc-400 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 px-3 py-1.5 rounded font-medium hover:text-zinc-200 transition-colors"
            >
              How it works
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded bg-zinc-950 border border-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col justify-center">
        
        {/* SCREEN 1: HOMEPAGE / LANDING (Ketika file kosong) */}
        {files.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-8">
            {/* Teks Kiri */}
            <div className="space-y-8">
              <div className="space-y-4">
                <span className={`text-xs font-extrabold tracking-widest ${t.text} uppercase font-mono ${t.bgMuted30} ${t.borderMuted50} px-3 py-1 rounded-full inline-block`}>
                  PDF TO MARKDOWN
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-100 tracking-tight leading-none uppercase font-sans">
                  BULK CONVERT <br />
                  PDF TO <span className={t.text}>MARKDOWN</span>
                </h1>
                <p className="text-zinc-400 text-base md:text-lg max-w-lg leading-relaxed">
                  Konversi banyak dokumen PDF sekaligus menjadi file Markdown bersih dan terstruktur dalam hitungan detik. 100% aman, privat, dan berjalan sepenuhnya di server lokal Anda.
                </p>
              </div>

              {/* Fitur Kunci */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-zinc-500">
                <div className="flex items-center space-x-2.5">
                  <ShieldCheck className={`w-5 h-5 ${t.text} shrink-0`} />
                  <span>No data stored</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Zap className={`w-5 h-5 ${t.text} shrink-0`} />
                  <span>Secure processing</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <Code className={`w-5 h-5 ${t.text} shrink-0`} />
                  <span>Developer first</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <ArrowRight className={`w-5 h-5 ${t.text} shrink-0`} />
                  <span>Lightning fast</span>
                </div>
              </div>

              {/* Tombol Upload Utama */}
              <div className="max-w-md">
                <DropZone onFilesSelected={handleFilesSelected} />
              </div>

              {/* Ringkasan Parameter */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-6 pt-4 border-t border-zinc-900 max-w-lg text-center font-mono">
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase font-bold">FAST</div>
                  <div className="text-lg font-bold text-zinc-300 mt-0.5">~2s / fl</div>
                  <div className="text-[9px] text-zinc-600">average</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase font-bold">SAFE</div>
                  <div className="text-lg font-bold text-zinc-300 mt-0.5">100%</div>
                  <div className="text-[9px] text-zinc-600">local processing</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase font-bold">SUPPORT</div>
                  <div className="text-lg font-bold text-zinc-300 mt-0.5">20</div>
                  <div className="text-[9px] text-zinc-600">files at once</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase font-bold">OUTPUT</div>
                  <div className="text-lg font-bold text-zinc-300 mt-0.5">.md</div>
                  <div className="text-[9px] text-zinc-600">clean markdown</div>
                </div>
              </div>
            </div>

            {/* Ilustrasi Grafik Kanan */}
            <div className="hidden lg:flex items-center justify-center relative">
              <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-[120px] max-w-md mx-auto"></div>
              <div className="relative border border-zinc-800 bg-zinc-900/10 p-10 rounded-2xl max-w-md w-full flex items-center justify-center space-x-8 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                <div className="flex flex-col items-center justify-center p-6 bg-zinc-950 border border-zinc-850 rounded-xl w-32 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                  <FileText className="w-12 h-12 text-rose-500" />
                  <span className="text-[10px] font-bold tracking-widest text-zinc-500 font-mono mt-3 uppercase">PDF</span>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className={`w-8 h-8 ${t.text} stroke-[1.5] animate-pulse`} />
                </div>
                <div className={`flex flex-col items-center justify-center p-6 bg-zinc-950 ${t.borderMuted} rounded-xl w-32 ${t.shadow10}`}>
                  <Code className={`w-12 h-12 ${t.text}`} />
                  <span className={`text-[10px] font-bold tracking-widest ${t.text} font-mono mt-3 uppercase`}>MD</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: UPLOAD AREA (Drag & Drop + File List) */}
        {files.length > 0 && activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Kiri: Area Dropzone & Statistik */}
            <div className="lg:col-span-1 space-y-6">
              <DropZone onFilesSelected={handleFilesSelected} />

              {/* Panel Statistik Premium */}
              <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-5 space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 tracking-wider uppercase">
                  CONVERSION STATS
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center font-mono">
                  <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900">
                    <div className="text-xs text-zinc-500 font-medium">TOTAL</div>
                    <div className="text-lg font-bold text-zinc-200 mt-1">{totalCount}</div>
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900">
                    <div className="text-xs text-yellow-500/80 font-medium">QUEUED</div>
                    <div className="text-lg font-bold text-yellow-500/90 mt-1">{queuedCount}</div>
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900">
                    <div className="text-xs text-blue-400 font-medium">PROC</div>
                    <div className="text-lg font-bold text-blue-400 mt-1">{processingCount}</div>
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900">
                    <div className={`text-xs ${t.text} font-medium`}>DONE</div>
                    <div className={`text-lg font-bold ${t.text} mt-1`}>{doneCount}</div>
                  </div>
                  <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-900">
                    <div className="text-xs text-rose-500 font-medium">ERR</div>
                    <div className="text-lg font-bold text-rose-500 mt-1">{errorCount}</div>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 bg-zinc-950/40 p-3 rounded border border-zinc-900 leading-relaxed">
                  ⚠️ <span className="font-medium text-zinc-400">Info:</span> Pemrosesan berjalan secara antrean (sequential) demi menjaga kestabilan memori server lokal.
                </div>
              </div>

              {/* Navigasi Lanjut */}
              {doneCount > 0 && (
                <button
                  onClick={() => setActiveTab('download')}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg ${t.bg} ${t.bgHover} text-zinc-950 font-bold transition-all ${t.shadow20}`}
                >
                  <span>Go to Download Page ({doneCount})</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Kanan: Daftar File */}
            <div className="lg:col-span-2 h-full min-h-[450px]">
              <FileList 
                files={files}
                onRemoveFile={handleRemoveFile}
                onPreviewFile={handlePreviewFile}
                onDownloadSingle={handleDownloadSingle}
                onRetryFile={handleRetryFile}
                onViewRis={(file) => {
                  setRisPreviewFile(file);
                  setIsRisPreviewOpen(true);
                }}
              />
            </div>
          </div>
        )}

        {/* SCREEN 3: PREVIEW PANEL (Split View) */}
        {files.length > 0 && activeTab === 'preview' && (
          <PreviewPanel 
            file={previewFile}
            onBack={() => setActiveTab('upload')}
            onDownloadSingle={handleDownloadSingle}
          />
        )}

        {/* SCREEN 4: DOWNLOAD PAGE (Summary & Actions) */}
        {files.length > 0 && activeTab === 'download' && (
          <DownloadPanel 
            files={files}
            onBackToUpload={() => setActiveTab('upload')}
            onClearAll={handleClearAll}
            onPreviewFile={handlePreviewFile}
            onDownloadSingle={handleDownloadSingle}
            onDownloadZip={handleDownloadZip}
            onViewRis={(file) => {
              setRisPreviewFile(file);
              setIsRisPreviewOpen(true);
            }}
            API_BASE={API_BASE}
          />
        )}

      </main>

      {/* Footer Premium */}
      <footer className="border-t border-zinc-900 py-4 px-6 bg-zinc-950/40 text-center text-xs text-zinc-600 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <span>BulkPDF2MD — Sliced with pure modern CSS & React components.</span>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-zinc-400 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#" className="hover:text-zinc-400 transition-colors">Github</a>
            <span>•</span>
            <a href="#" className="hover:text-zinc-400 transition-colors">Docs</a>
          </div>
        </div>
      </footer>

      {/* Pop-up Apresiasi Traktir Kopi */}
      <SupportModal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />

      {/* Pop-up Cara Kerja */}
      <HowItWorksModal isOpen={isHowItWorksOpen} onClose={() => setIsHowItWorksOpen(false)} />

      {/* Pop-up Pengaturan */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        accentColor={accentColor}
        onChangeAccent={setAccentColor}
        processingMode={processingMode}
        onChangeProcessingMode={setProcessingMode}
        autoClear={autoClear}
        onChangeAutoClear={setAutoClear}
      />

      {/* Pop-up Panduan Masuk Awal (AI Guide) */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {/* Pop-up RIS Preview */}
      <RisPreviewModal
        isOpen={isRisPreviewOpen}
        onClose={() => setIsRisPreviewOpen(false)}
        file={risPreviewFile}
        onDownloadSingle={handleDownloadSingle}
        onSaveMetadata={handleSaveMetadata}
      />

      {/* Pop-up Riwayat Konversi */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onPreviewFile={handlePreviewFile}
        onDownloadSingle={handleDownloadSingle}
      />
    </div>
  );
}
