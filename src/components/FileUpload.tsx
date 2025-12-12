'use client';

import { useCallback, useState } from 'react';
import { Upload, X, FileText, Image as ImageIcon, FileCode } from 'lucide-react';
import { UploadedFile } from '@/types';

interface FileUploadProps {
  onFilesSelected: (files: UploadedFile[]) => void;
  files: UploadedFile[];
  onRemoveFile: (id: string) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUpload({ onFilesSelected, files, onRemoveFile }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback(async (fileList: FileList) => {
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      
      if (file.size > MAX_FILE_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        continue;
      }

      // Convert to base64 for images and PDFs
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = (e) => {
          resolve(e.target?.result as string);
        };
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          reader.readAsDataURL(file);
        } else {
          reader.readAsText(file);
        }
      });

      const content = await base64Promise;

      newFiles.push({
        id: `${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        base64: content
      });
    }

    onFilesSelected(newFiles);
  }, [onFilesSelected]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon size={16} />;
    if (type.includes('pdf')) return <FileText size={16} />;
    return <FileCode size={16} />;
  };

  return (
    <>
      {/* Drag Overlay */}
      {isDragging && (
        <div className="drag-overlay">
          <div className="text-center">
            <Upload size={48} className="text-claude-orange mx-auto mb-3" />
            <p className="text-lg font-medium text-claude-orange">
              Drop files here
            </p>
          </div>
        </div>
      )}

      {/* File Preview List */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="group relative flex items-center gap-2 px-3 py-2 bg-claude-bg dark:bg-claude-bg-dark border border-claude-border dark:border-claude-border-dark rounded-lg max-w-xs"
            >
              {/* File Preview */}
              {file.type.startsWith('image/') ? (
                <img 
                  src={file.url} 
                  alt={file.name}
                  className="w-10 h-10 object-cover rounded"
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-claude-surface dark:bg-claude-surface-dark rounded">
                  {getFileIcon(file.type)}
                </div>
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-claude-text dark:text-claude-text-dark truncate">
                  {file.name}
                </p>
                <p className="text-xs text-claude-text-muted dark:text-claude-text-muted-dark">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => onRemoveFile(file.id)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
              >
                <X size={14} className="text-red-600 dark:text-red-400" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button/Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className="relative"
      >
        <input
          type="file"
          multiple
          onChange={handleFileInput}
          accept="image/*,.pdf,.txt,.js,.ts,.tsx,.jsx,.py,.java,.cpp,.c,.html,.css,.json,.md"
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-sm text-claude-text-muted dark:text-claude-text-muted-dark hover:text-claude-text dark:hover:text-claude-text-dark hover:bg-claude-bg dark:hover:bg-claude-bg-dark rounded-lg transition-colors"
        >
          <Upload size={16} />
          <span>Attach files</span>
        </label>
      </div>
    </>
  );
}
