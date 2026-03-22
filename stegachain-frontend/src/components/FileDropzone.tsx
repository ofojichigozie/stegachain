/**
 * FileDropzone — styled file picker with drag-and-drop support.
 */

import { useRef, useState } from "react";

interface FileDropzoneProps {
  accept?: string;
  label: string;
  hint?: string;
  onFile: (file: File) => void;
  file?: File | null;
}

export function FileDropzone({
  accept = "image/png",
  label,
  hint = "PNG only",
  onFile,
  file,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onFile(files[0]);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`
        relative cursor-pointer rounded-xl border-2 border-dashed
        flex flex-col items-center justify-center gap-2 px-6 py-8
        transition-colors duration-150
        ${
          isDragging
            ? "border-white bg-white/5"
            : file
              ? "border-neutral-500 bg-white/5"
              : "border-neutral-700 hover:border-neutral-500 bg-neutral-900/50"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {file ? (
        <>
          <span className="text-2xl">🖼️</span>
          <span className="text-sm font-medium text-white text-center break-all">
            {file.name}
          </span>
          <span className="text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)} KB · Click to replace
          </span>
        </>
      ) : (
        <>
          <span className="text-2xl text-gray-500">📁</span>
          <span className="text-sm font-medium text-neutral-300">{label}</span>
          <span className="text-xs text-gray-500">{hint}</span>
        </>
      )}
    </div>
  );
}
