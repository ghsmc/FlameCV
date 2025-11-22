import React, { useState } from 'react';
import { FileData } from '../types';
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: FileData) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setError("Supported formats: PDF, Images, or Text.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size limit is 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      onFileSelect({
        base64,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.onerror = () => setError("Failed to process file.");
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative group cursor-pointer
          border rounded-xl p-12 transition-all duration-300 ease-out
          flex flex-col items-center justify-center text-center
          ${isDragging 
            ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/10 scale-[1.01] shadow-lg ring-1 ring-orange-500/20' 
            : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-600 hover:-translate-y-0.5'
          }
        `}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleInputChange}
          accept=".pdf, .txt, .jpg, .jpeg, .png, .webp"
        />
        
        <div className={`
          mb-6 p-4 rounded-full shadow-sm border transition-all duration-300
          ${isDragging 
            ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800' 
            : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-gray-700'
          }
        `}>
          <ArrowUpTrayIcon className={`w-6 h-6 ${isDragging ? 'text-orange-600 dark:text-orange-400' : 'text-gray-900 dark:text-white'}`} />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 tracking-tight">
          Upload resume
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs leading-relaxed">
          Drop your PDF here, or click to browse.
        </p>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
            <DocumentTextIcon className="w-3.5 h-3.5" />
            PDF, TXT, IMG
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">Max 10MB</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-center animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}
    </div>
  );
};