import React, { useState, useRef } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

export default function DropZone({ onFilesSelected }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const allowedMimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      const selectedFiles = Array.from(e.dataTransfer.files).filter(
        file => allowedMimes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx')
      );
      if (selectedFiles.length > 0) {
        onFilesSelected(selectedFiles);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const allowedMimes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      const selectedFiles = Array.from(e.target.files).filter(
        file => allowedMimes.includes(file.type) || file.name.endsWith('.pdf') || file.name.endsWith('.docx')
      );
      if (selectedFiles.length > 0) {
        onFilesSelected(selectedFiles);
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={onButtonClick}
      className={`relative flex flex-col items-center justify-center w-full min-h-[280px] p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 select-none group
        ${isDragActive 
          ? 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]' 
          : 'border-zinc-800 bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-zinc-900/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.05)]'
        }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <div className={`p-4 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-400 transition-all duration-300 group-hover:scale-110 group-hover:text-emerald-400 group-hover:border-emerald-500/30 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]
          ${isDragActive ? 'text-emerald-400 border-emerald-400 scale-110 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''}`}
        >
          <UploadCloud className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-zinc-200 font-medium tracking-wide text-lg">
            DRAG & DROP PDF OR WORD FILES HERE
          </h3>
          <p className="text-zinc-500 text-sm">
            or <span className="text-emerald-400 font-semibold group-hover:underline">click to select files</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center text-[11px] text-zinc-600 font-mono pt-2">
          <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-900">PDF & DOCX</span>
          <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-900">MAX 10MB/FILE</span>
          <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-900">UP TO 20 FILES</span>
        </div>
      </div>
    </div>
  );
}
