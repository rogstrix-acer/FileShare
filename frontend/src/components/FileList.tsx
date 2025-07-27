'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Image,
  Video,
  Music,
  Archive,
  File,
  Share2,
  Trash2,
  Download,
  Calendar,
  HardDrive,
  Copy,
  ExternalLink,
  MoreVertical,
  Upload
} from 'lucide-react';

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
  onSwitchToUpload?: () => void;
}

export default function FileList({ refreshTrigger, onSwitchToUpload }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareLoading, setShareLoading] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [expiryDate, setExpiryDate] = useState('');
  const [maxDownloads, setMaxDownloads] = useState('');

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const fetchFiles = async () => {
    try {
      const response = await apiClient.getUserFiles();
      if (response.success && response.data) {
        const files = Array.isArray(response.data)
          ? response.data
          : (response.data as any)?.files || [];
        setFiles(files);
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
      const shareData: any = {};

      if (expiryDate) {
        shareData.expiresAt = new Date(expiryDate).toISOString();
      }

      if (maxDownloads) {
        shareData.maxDownloads = parseInt(maxDownloads);
      }

      const response = await apiClient.createShareLink(fileId, shareData.expiresAt);
      if (response.success && response.data) {
        const shareUrl = response.data.shareLink;
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link created and copied to clipboard!');

        // Reset form
        setShowShareModal(null);
        setExpiryDate('');
        setMaxDownloads('');
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

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive;
    return File;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800';
    if (mimeType.startsWith('video/')) return 'bg-purple-100 text-purple-800';
    if (mimeType.startsWith('audio/')) return 'bg-yellow-100 text-yellow-800';
    if (mimeType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (mimeType.includes('document')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
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
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <FileText className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Upload your first file to get started with sharing
        </p>
        <Button
          onClick={onSwitchToUpload}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </h3>
          <Badge variant="secondary">
            {formatFileSize(files.reduce((total, file) => total + file.size, 0))} total
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Files Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file, index) => {
            const FileIcon = getFileIcon(file.mimeType);
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group hover:shadow-lg transition-all duration-200 border-0 bg-white dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      {/* File Icon and Type */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <FileIcon className="w-6 h-6 text-white" />
                        </div>
                        <Badge className={getFileTypeColor(file.mimeType)}>
                          {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                        </Badge>
                      </div>

                      {/* File Info */}
                      <div className="space-y-1">
                        <h4 className="font-medium text-gray-900 dark:text-white truncate" title={file.originalName}>
                          {file.originalName}
                        </h4>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-2">
                          <HardDrive className="w-3 h-3" />
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(file.createdAt)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => setShowShareModal(file.fileId)}
                          disabled={shareLoading === file.fileId}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {shareLoading === file.fileId ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFile(file.fileId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.mimeType);
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white truncate">
                            {file.originalName}
                          </h4>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                            <span>{formatFileSize(file.size)}</span>
                            <span>{formatDate(file.createdAt)}</span>
                            <Badge className={getFileTypeColor(file.mimeType)}>
                              {file.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleCreateShare(file.fileId)}
                          disabled={shareLoading === file.fileId}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          {shareLoading === file.fileId ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Share2 className="w-3 h-3 mr-1" />
                              Share
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteFile(file.fileId)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}