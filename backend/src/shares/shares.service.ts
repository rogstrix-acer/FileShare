import { Injectable } from '@nestjs/common';
import { AppwriteService } from '../appwrite/appwrite.service';

@Injectable()
export class SharesService {
    constructor(private appwriteService: AppwriteService) { }

    async getSharedFile(shareToken: string) {
        try {
            const validation = await this.appwriteService.validateShare(shareToken);
            if (!validation.valid || !validation.share) {
                return {
                    success: false,
                    message: validation.reason || 'Share not found'
                };
            }

            const share = validation.share;
            const file = await this.appwriteService.getFileById(share.fileId);

            if (!file) {
                return {
                    success: false,
                    message: 'File not found'
                };
            }

            return {
                success: true,
                message: 'Shared file retrieved successfully',
                file: {
                    id: file.$id,
                    fileId: file.fileId,
                    originalName: file.originalName,
                    size: file.size,
                    mimeType: file.mimeType,
                    createdAt: file.createdAt
                },
                share: {
                    shareToken: share.shareToken,
                    downloadCount: share.downloadCount,
                    maxDownloads: share.maxDownloads,
                    expiresAt: share.expiresAt,
                    createdAt: share.createdAt
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Share link not found or expired'
            };
        }
    }

    async downloadSharedFile(shareToken: string) {
        try {
            const validation = await this.appwriteService.validateShare(shareToken);
            if (!validation.valid || !validation.share) {
                return {
                    success: false,
                    message: validation.reason || 'Share not found'
                };
            }

            const share = validation.share;

            // Increment download count
            await this.appwriteService.incrementDownloadCount(shareToken);

            // Get download URL
            const downloadUrl = await this.appwriteService.getFileDownloadUrl(share.fileId);

            return {
                success: true,
                message: 'File download initiated',
                downloadUrl
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to download file'
            };
        }
    }

    async getShareStats(shareToken: string) {
        try {
            const share = await this.appwriteService.getShareByToken(shareToken);
            if (!share) {
                return {
                    success: false,
                    message: 'Share not found'
                };
            }

            const isExpired = share.expiresAt && new Date(share.expiresAt) < new Date();
            const isLimitReached = share.maxDownloads && share.downloadCount >= share.maxDownloads;

            return {
                success: true,
                message: 'Share statistics retrieved',
                stats: {
                    shareToken: share.shareToken,
                    downloadCount: share.downloadCount || 0,
                    maxDownloads: share.maxDownloads,
                    expiresAt: share.expiresAt,
                    createdAt: share.createdAt,
                    isExpired: !!isExpired,
                    isLimitReached: !!isLimitReached,
                    isActive: !isExpired && !isLimitReached
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to get share statistics'
            };
        }
    }

    async deleteShare(shareToken: string, userId: string) {
        try {
            await this.appwriteService.deleteShare(shareToken, userId);
            return {
                success: true,
                message: 'Share link deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to delete share link'
            };
        }
    }
}