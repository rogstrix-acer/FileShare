import { Injectable } from '@nestjs/common';
import { AppwriteService } from '../appwrite/appwrite.service';

@Injectable()
export class FilesService {
    constructor(private appwriteService: AppwriteService) {}

    async uploadFile(file: Express.Multer.File, userId: string) {
        try {
            const result = await this.appwriteService.uploadFile(file, userId);
            if (result.success) {
                return {
                    success: true,
                    message: 'File uploaded successfully',
                    fileId: result.fileId,
                    fileName: file.originalname,
                    size: file.size,
                    mimeType: file.mimetype
                };
            }
            return {
                success: false,
                message: result.error || 'Failed to upload file'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Upload failed'
            };
        }
    }

    async createShareLink(fileId: string, userId: string, expiresAt?: Date) {
        try {
            // Verify file belongs to user (you might want to add this check)
            const shareLink = await this.appwriteService.createShareLink(fileId, expiresAt);
            return {
                success: true,
                message: 'Share link created successfully',
                shareLink,
                expiresAt: expiresAt?.toISOString()
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to create share link'
            };
        }
    }

    async getUserFiles(userId: string) {
        try {
            const files = await this.appwriteService.getUserFiles(userId);
            return {
                success: true,
                message: 'Files retrieved successfully',
                files: files.map(file => ({
                    id: file.$id,
                    fileId: file.fileId,
                    originalName: file.originalName,
                    size: file.size,
                    mimeType: file.mimeType,
                    createdAt: file.createdAt
                }))
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to get files'
            };
        }
    }

    async deleteFile(fileId: string, userId: string) {
        try {
            await this.appwriteService.deleteFile(fileId, userId);
            return {
                success: true,
                message: 'File deleted successfully'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to delete file'
            };
        }
    }

    async getFileInfo(fileId: string) {
        try {
            const file = await this.appwriteService.getFileById(fileId);
            if (!file) {
                return {
                    success: false,
                    message: 'File not found'
                };
            }
            return {
                success: true,
                message: 'File info retrieved successfully',
                file: {
                    id: file.$id,
                    fileId: file.fileId,
                    originalName: file.originalName,
                    size: file.size,
                    mimeType: file.mimeType,
                    userId: file.userId,
                    createdAt: file.createdAt
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to get file info'
            };
        }
    }

    async getUserShares(userId: string) {
        try {
            console.log('Getting shares for user:', userId);
            const shares = await this.appwriteService.getUserShares(userId);
            console.log('Raw shares from Appwrite:', shares.length);
            
            // Enrich shares with file information
            const enrichedShares = await Promise.all(
                shares.map(async (share) => {
                    try {
                        console.log('Processing share:', share.$id, 'for fileId:', share.fileId);
                        const file = await this.appwriteService.getFileById(share.fileId);
                        
                        const enrichedShare = {
                            id: share.$id,
                            fileId: share.fileId,
                            fileName: file?.originalName || `File_${share.fileId.slice(0, 8)}`,
                            shareToken: share.shareToken,
                            downloadCount: share.downloadCount || 0,
                            maxDownloads: share.maxDownloads,
                            expiresAt: share.expiresAt,
                            createdAt: share.createdAt,
                            isExpired: share.expiresAt ? new Date(share.expiresAt) < new Date() : false,
                            isLimitReached: share.maxDownloads ? (share.downloadCount || 0) >= share.maxDownloads : false
                        };
                        
                        console.log('Enriched share:', enrichedShare);
                        return enrichedShare;
                    } catch (fileError) {
                        console.warn(`Failed to get file info for share ${share.$id}:`, fileError.message);
                        // Return share data even if file lookup fails
                        return {
                            id: share.$id,
                            fileId: share.fileId,
                            fileName: `File_${share.fileId.slice(0, 8)}`,
                            shareToken: share.shareToken,
                            downloadCount: share.downloadCount || 0,
                            maxDownloads: share.maxDownloads,
                            expiresAt: share.expiresAt,
                            createdAt: share.createdAt,
                            isExpired: share.expiresAt ? new Date(share.expiresAt) < new Date() : false,
                            isLimitReached: share.maxDownloads ? (share.downloadCount || 0) >= share.maxDownloads : false
                        };
                    }
                })
            );

            console.log('Final enriched shares:', enrichedShares.length);
            return {
                success: true,
                message: 'Shares retrieved successfully',
                shares: enrichedShares
            };
        } catch (error) {
            console.error('Error in getUserShares:', error);
            return {
                success: false,
                message: error.message || 'Failed to get shares'
            };
        }
    }
}