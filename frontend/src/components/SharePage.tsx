'use client';

import { useState, useEffect, useCallback } from 'react';

interface SharePageProps {
  shareToken: string;
}

interface SharedFile {
  file: {
    id: string;
    fileId: string;
    originalName: string;
    size: number;
    mimeType: string;
    createdAt: string;
  };
  share: {
    shareToken: string;
    downloadCount: number;
    maxDownloads?: number;
    expiresAt?: string;
    createdAt: string;
  };
}

export default function SharePage({ shareToken }: SharePageProps) {
  const [sharedFile, setSharedFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const fetchSharedFile = useCallback(async () => {
    try {
      const response = await fetch(`/api/shares/${shareToken}`);
      const data = await response.json();

      if (response.ok) {
        setSharedFile(data);
      } else {
        setError(data.message || 'Share not found');
      }
    } catch (error) {
      setError('Failed to load shared file '+error);
    } finally {
      setLoading(false);
    }
  }, [shareToken]);

  useEffect(() => {
    fetchSharedFile();
  }, [fetchSharedFile]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/shares/${shareToken}/download`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok && data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
        // Refresh the share data to update download count
        await fetchSharedFile();
      } else {
        alert('Download failed: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Download failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setDownloading(false);
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

  const isExpired = sharedFile?.share.expiresAt && new Date(sharedFile.share.expiresAt) < new Date();
  const isLimitReached = sharedFile?.share.maxDownloads && 
    sharedFile.share.downloadCount >= sharedFile.share.maxDownloads;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Share Not Found</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!sharedFile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">FileShare</h1>
          <p className="text-gray-600 mt-2">Someone shared a file with you</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center mb-6">
            <svg
              className="mx-auto h-16 w-16 text-indigo-600 mb-4"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {sharedFile.file.originalName}
            </h2>
            <p className="text-gray-600">
              {formatFileSize(sharedFile.file.size)}
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-6">
            <dl className="space-y-2">
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Shared on:</dt>
                <dd className="text-gray-900">{formatDate(sharedFile.share.createdAt)}</dd>
              </div>
              <div className="flex justify-between text-sm">
                <dt className="text-gray-500">Downloads:</dt>
                <dd className="text-gray-900">
                  {sharedFile.share.downloadCount}
                  {sharedFile.share.maxDownloads && ` / ${sharedFile.share.maxDownloads}`}
                </dd>
              </div>
              {sharedFile.share.expiresAt && (
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">Expires:</dt>
                  <dd className={`${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(sharedFile.share.expiresAt)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {isExpired ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">This share has expired</p>
              <button
                disabled
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
              >
                Download Unavailable
              </button>
            </div>
          ) : isLimitReached ? (
            <div className="text-center">
              <p className="text-red-600 mb-4">Download limit reached</p>
              <button
                disabled
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
              >
                Download Unavailable
              </button>
            </div>
          ) : (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Preparing Download...
                </>
              ) : (
                <>
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download File
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}