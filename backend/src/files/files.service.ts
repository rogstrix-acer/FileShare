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
            const shares = await this.appwriteService.getUserShares(userId);
            return {
                success: true,
                message: 'Shares retrieved successfully',
                shares: shares.map(share => ({
                    id: share.$id,
                    fileId: share.fileId,
                    shareToken: share.shareToken,
                    downloadCount: share.downloadCount,
                    maxDownloads: share.maxDownloads,
                    expiresAt: share.expiresAt,
                    createdAt: share.createdAt
                }))
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to get shares'
            };
        }
    }
}