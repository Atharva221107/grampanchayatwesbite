import { useState, useRef, ReactNode } from 'react';
import { Upload, X, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { uploadFile, deleteFileFromUrl, validateFileType, formatBytes } from '@/lib/storage';

interface FileUploadProps {
  label: string;
  folder: string;
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  allowedTypes?: string[];
  preview?: 'image' | 'file';
  required?: boolean;
  hint?: string;
}

export default function FileUpload({
  label,
  folder,
  value,
  onChange,
  accept,
  allowedTypes,
  preview = 'image',
  required = false,
  hint,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (allowedTypes && !validateFileType(file, allowedTypes)) {
      setError('Invalid file type. Please upload a supported file.');
      return;
    }

    setUploading(true);
    setProgress(0);

    if (value) {
      await deleteFileFromUrl(value);
    }

    const result = await uploadFile(file, folder, setProgress);
    setUploading(false);

    if (result) {
      onChange(result.url);
    } else {
      setError('Upload failed. Please try again.');
    }
  };

  const handleRemove = async () => {
    if (value) {
      await deleteFileFromUrl(value);
    }
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-primary-700 mb-1.5">
        {label}
        {required && <span className="text-error-500"> *</span>}
      </label>
      {hint && <p className="text-xs text-primary-400 mb-2">{hint}</p>}

      {value ? (
        <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
          {preview === 'image' ? (
            <img src={value} alt="Preview" className="h-16 w-16 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary-200 text-primary-600 shrink-0">
              <FileText size={24} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-primary-700 truncate">File uploaded</p>
            <a href={value} target="_blank" rel="noopener noreferrer" className="text-xs text-accent-saffron hover:underline">
              View file
            </a>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-primary-400 hover:bg-error-50 hover:text-error-600 transition-colors shrink-0"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            error ? 'border-error-300 bg-error-50' : 'border-primary-200 hover:border-accent-saffron hover:bg-accent-saffron/5'
          }`}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-accent-saffron" />
              <div className="w-full max-w-xs bg-primary-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-accent-saffron h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-primary-500">{progress}%</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {preview === 'image' ? <ImageIcon size={24} className="text-primary-400" /> : <Upload size={24} className="text-primary-400" />}
              <p className="text-sm text-primary-500">Click to upload</p>
              {accept && <p className="text-xs text-primary-400">Accepted: {accept}</p>}
            </div>
          )}
        </div>
      )}

      {error && <p className="text-xs text-error-500 mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}
