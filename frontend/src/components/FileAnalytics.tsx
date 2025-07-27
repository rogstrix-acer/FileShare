'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import {
    Share2,
    Copy,
    ExternalLink,
    Plus,
    Eye
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface FileWithShares {
    id: string;
    fileId: string;
    originalName: string;
    size: number;
    mimeType: string;
    createdAt: string;
    shares: Array<{
        id: string;
        shareToken: string;
        downloadCount: number;
        maxDownloads?: number;
        expiresAt?: string;
        createdAt: string;
        isExpired: boolean;
        isLimitReached: boolean;
    }>;
    totalDownloads: number;
    activeShares: number;
    expiredShares: number;
}

export default function FileAnalytics() {
    const [files, setFiles] = useState<FileWithShares[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<FileWithShares | null>(null);
    const [showCreateShare, setShowCreateShare] = useState<string | null>(null);
    const [expiryDate, setExpiryDate] = useState('');
    const [maxDownloads, setMaxDownloads] = useState('');

    useEffect(() => {
        fetchFileAnalytics();
    }, []);

    const fetchFileAnalytics = async () => {
        try {
            setLoading(true);

            // Get user files
            const filesResponse = await apiClient.getUserFiles();
            if (!filesResponse.success || !filesResponse.data) {
                setFiles([]);
                return;
            }

            const userFiles = Array.isArray(filesResponse.data)
                ? filesResponse.data
                : (filesResponse.data as any)?.files || [];

            // Get user shares
            const sharesResponse = await apiClient.getUserShares();
            console.log('Shares response:', sharesResponse);
            console.log('Shares response data:', sharesResponse.data);
            const shares = sharesResponse.success && sharesResponse.data ? sharesResponse.data.shares || [] : [];
            console.log('Extracted shares:', shares);

            // Combine files with their shares
            const filesWithShares: FileWithShares[] = userFiles.map((file: { id: string; fileId: string; originalName: string; size: number; mimeType: string; createdAt: string }) => {
                const fileShares = shares.filter((share: { fileId: string }) => share.fileId === file.fileId);

                return {
                    id: file.id,
                    fileId: file.fileId,
                    originalName: file.originalName,
                    size: file.size,
                    mimeType: file.mimeType,
                    createdAt: file.createdAt,
                    shares: fileShares,
                    totalDownloads: fileShares.reduce((sum: number, share: { downloadCount?: number }) => sum + (share.downloadCount || 0), 0),
                    activeShares: fileShares.filter((share: { isExpired?: boolean; isLimitReached?: boolean }) => !share.isExpired && !share.isLimitReached).length,
                    expiredShares: fileShares.filter((share: { isExpired?: boolean; isLimitReached?: boolean }) => share.isExpired || share.isLimitReached).length
                };
            });

            setFiles(filesWithShares);
        } catch (error) {
            console.error('Failed to fetch file analytics:', error);
            setFiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateShare = async (fileId: string) => {
        try {
            const shareData: { expiresAt?: string; maxDownloads?: number } = {};

            if (expiryDate) {
                shareData.expiresAt = new Date(expiryDate).toISOString();
            }

            if (maxDownloads) {
                shareData.maxDownloads = parseInt(maxDownloads);
            }

            const response = await apiClient.createShareLink(fileId, shareData.expiresAt, shareData.maxDownloads);
            console.log('Create share response:', response);

            if (response.success && response.data) {
                const shareUrl = response.data.shareLink;
                await navigator.clipboard.writeText(shareUrl);
                alert('Share link created and copied to clipboard!');

                // Reset form and refresh data
                setShowCreateShare(null);
                setExpiryDate('');
                setMaxDownloads('');
                fetchFileAnalytics();
            } else {
                console.error('Failed to create share link:', response);
                alert('Failed to create share link: ' + response.error);
            }
        } catch (error) {
            alert('Failed to create share link: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
    };

    const copyShareLink = async (shareToken: string) => {
        const shareUrl = `${window.location.origin}/share/${shareToken}`;
        await navigator.clipboard.writeText(shareUrl);
        alert('Share link copied to clipboard!');
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
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (files.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Share2 className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No files to analyze</h3>
                <p className="text-gray-500 dark:text-gray-400">
                    Upload some files and create share links to see analytics
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Files Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file, index) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedFile(file)}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium truncate" title={file.originalName}>
                                        {file.originalName}
                                    </CardTitle>
                                    <Badge variant="secondary">{formatFileSize(file.size)}</Badge>
                                </div>
                                <CardDescription className="text-xs">
                                    Created {formatDate(file.createdAt)}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">{file.totalDownloads}</div>
                                        <div className="text-xs text-gray-500">Downloads</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-600">{file.activeShares}</div>
                                        <div className="text-xs text-gray-500">Active</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-red-600">{file.expiredShares}</div>
                                        <div className="text-xs text-gray-500">Expired</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex space-x-2">
                                    <Button
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowCreateShare(file.fileId);
                                        }}
                                        className="flex-1"
                                    >
                                        <Plus className="w-3 h-3 mr-1" />
                                        New Share
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(file);
                                        }}
                                    >
                                        <Eye className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Create Share Modal */}
            {showCreateShare && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle>Create Share Link</CardTitle>
                            <CardDescription>Set expiry date and download limits for your share link</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Expiry Date (Optional)
                                </label>
                                <Input
                                    type="datetime-local"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Max Downloads (Optional)
                                </label>
                                <Input
                                    type="number"
                                    placeholder="Unlimited"
                                    value={maxDownloads}
                                    onChange={(e) => setMaxDownloads(e.target.value)}
                                    min="1"
                                />
                            </div>

                            <div className="flex space-x-2 pt-4">
                                <Button
                                    onClick={() => handleCreateShare(showCreateShare)}
                                    className="flex-1"
                                >
                                    Create Share Link
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowCreateShare(null);
                                        setExpiryDate('');
                                        setMaxDownloads('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* File Details Modal */}
            {selectedFile && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{selectedFile.originalName}</CardTitle>
                                    <CardDescription>
                                        {formatFileSize(selectedFile.size)} • Created {formatDate(selectedFile.createdAt)}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                                    Close
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Analytics Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Download Activity</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={selectedFile.shares.map(share => ({
                                                name: `Share ${share.shareToken.slice(0, 8)}`,
                                                downloads: share.downloadCount
                                            }))}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="name" />
                                                <YAxis />
                                                <Tooltip />
                                                <Bar dataKey="downloads" fill="#3B82F6" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Share Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span>Total Shares</span>
                                                <Badge>{selectedFile.shares.length}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Active Shares</span>
                                                <Badge variant="success">{selectedFile.activeShares}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Expired Shares</span>
                                                <Badge variant="destructive">{selectedFile.expiredShares}</Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span>Total Downloads</span>
                                                <Badge variant="secondary">{selectedFile.totalDownloads}</Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Share Links List */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Share Links</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {selectedFile.shares.map((share) => (
                                            <div key={share.id} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="font-mono text-sm">{share.shareToken.slice(0, 16)}...</span>
                                                        {share.isExpired && <Badge variant="destructive">Expired</Badge>}
                                                        {share.isLimitReached && <Badge variant="warning">Limit Reached</Badge>}
                                                        {!share.isExpired && !share.isLimitReached && <Badge variant="success">Active</Badge>}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {share.downloadCount} downloads
                                                        {share.maxDownloads && ` / ${share.maxDownloads} max`}
                                                        {share.expiresAt && ` • Expires ${formatDate(share.expiresAt)}`}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => copyShareLink(share.shareToken)}
                                                    >
                                                        <Copy className="w-3 h-3" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => window.open(`/share/${share.shareToken}`, '_blank')}
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}