'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface FileItem {
  id: string;
  fileId: string;
  originalName: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

interface FileListProps {
  refreshTrigger: number;
}

export default function FileList({ refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const fetchFiles = async () => {
    try {
      const response = await apiClient.getUserFiles();
      if (response.success && response.data) {
        setFiles(response.data.files || []);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShare = async (fileId: string) => {
    setShareLoading(fileId);
    try {
      const response = await apiClient.createShareLink(fileId);
      if (response.success && response.data) {
        const shareUrl = response.data.shareLink;
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
      } else {
        alert('Failed to create share link: ' + response.error);
      }
    } catch (error) {
      alert('Failed to create share link: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setShareLoading(null);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    try {
      const response = await apiClient.deleteFile(fileId);
      if (response.success) {
        setFiles(files.filter(file => file.fileId !== fileId));
      } else {
        alert('Failed to delete file: ' + response.error);
      }
    } catch (error) {
      alert('Failed to delete file: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No files uploaded yet. Upload your first file above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {files.map((file) => (
          <li key={file.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-8 w-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.originalName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCreateShare(file.fileId)}
                  disabled={shareLoading === file.fileId}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {shareLoading === file.fileId ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                        />
                      </svg>
                      Share
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteFile(file.fileId)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}