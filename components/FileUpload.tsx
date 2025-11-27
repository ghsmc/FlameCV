import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileData } from '../types';
import { ArrowUpTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileSelect: (file: FileData) => void;
}

const smoothEase = [0.22, 1, 0.36, 1];

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
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{ 
          borderColor: isDragging ? '#f97316' : undefined,
          backgroundColor: isDragging ? 'rgba(249, 115, 22, 0.02)' : undefined
        }}
        transition={{ duration: 0.2, ease: smoothEase }}
        className={`
          relative cursor-pointer
          border-2 border-dashed rounded-2xl p-12 transition-all duration-200
          flex flex-col items-center justify-center text-center
          border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.02]
          hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-white/[0.03]
        `}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleInputChange}
          accept=".pdf, .txt, .jpg, .jpeg, .png, .webp"
        />
        
        <div className={`
          mb-6 p-4 rounded-xl transition-all duration-200
          ${isDragging 
            ? 'bg-orange-100 dark:bg-orange-900/20' 
            : 'bg-gray-100 dark:bg-white/5'
          }
        `}>
          <ArrowUpTrayIcon className={`w-6 h-6 transition-colors duration-200 ${
            isDragging 
              ? 'text-orange-600 dark:text-orange-400' 
              : 'text-gray-500 dark:text-gray-400'
          }`} />
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {isDragging ? "Drop to upload" : "Upload your resume"}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
          {isDragging ? "Release to upload your file" : "Drag and drop your PDF, or click to browse"}
        </p>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1.5 rounded-lg">
            <DocumentTextIcon className="w-3.5 h-3.5" />
            PDF, TXT, IMG
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">Max 10MB</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: smoothEase }}
            className="mt-4 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
