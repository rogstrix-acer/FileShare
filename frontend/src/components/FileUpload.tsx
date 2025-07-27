'use client';

import { useState, useRef } from 'react';
import { apiClient } from '@/lib/api';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      console.log('Uploading file:', file.name);
      const response = await apiClient.uploadFile(file);
      if (response.success) {
        onUploadSuccess();
        console.log('Upload successful');
      } else {
        alert('Upload failed: ' + response.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed');
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Selected files:', Array.from(files).map(f => f.name));
      // Handle multiple files
      Array.from(files).forEach(file => {
        handleFileUpload(file);
      });
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    console.log('Files dropped');
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      console.log('Dropped files:', Array.from(files).map(f => f.name));
      // Handle multiple files
      Array.from(files).forEach(file => {
        handleFileUpload(file);
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragOver to false if we're leaving the dropzone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOver(false);
    }
  };

  // Direct function to trigger file input
  const triggerFileInput = () => {
    console.log('triggerFileInput called');
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '*/*';
    input.style.display = 'none';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (files && files.length > 0) {
        console.log('Files selected via created input:', Array.from(files).map(f => f.name));
        Array.from(files).forEach(file => {
          handleFileUpload(file);
        });
      }
      document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
  };

  // Alternative method using the ref
  const openFileDialog = () => {
    console.log('openFileDialog called');
    console.log('fileInputRef.current:', fileInputRef.current);
    
    if (fileInputRef.current) {
      fileInputRef.current.click();
      console.log('Clicked file input via ref');
    } else {
      console.log('Ref is null, using alternative method');
      triggerFileInput();
    }
  };

  return (
    <div className="mb-8">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        accept="*/*"
      />

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Uploading...</p>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {dragOver ? 'Drop files here' : 'Upload your files'}
            </h3>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Drag and drop files here, or click to browse
            </p>

            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-  1">
                <span>⚡</span>
                <span>Fast upload</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📁</span>
                <span>Any file type</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📤</span>
                <span>Multiple files</span>
              </div>
            </div>
            
            {/* Multiple button approaches */}
            <div className="space-y-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Button 1 clicked');
                  openFileDialog();
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                type="button"
              >
                Choose Files
              </button>
              
              <br />
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Button 2 clicked');
                  triggerFileInput();
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                type="button"
              >
                Alternative Method
              </button>
              
              <br />
              
              {/* Label approach */}
              <label className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer">
                Label Method
                <input
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}