import { 
    Controller, 
    Post, 
    Get, 
    Delete, 
    Param, 
    Body, 
    UseInterceptors, 
    UploadedFile, 
    Query 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
    constructor(private filesService: FilesService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body('userId') userId: string
    ) {
        if (!file) {
            return {
                success: false,
                message: 'No file provided'
            };
        }
        return this.filesService.uploadFile(file, userId);
    }

    @Post(':fileId/share')
    async createShareLink(
        @Param('fileId') fileId: string,
        @Body() shareData: { 
            userId: string; 
            expiresAt?: string;
            maxDownloads?: number;
        }
    ) {
        const expiresAt = shareData.expiresAt ? new Date(shareData.expiresAt) : undefined;
        return this.filesService.createShareLink(fileId, shareData.userId, expiresAt);
    }

    @Get('user/:userId')
    async getUserFiles(@Param('userId') userId: string) {
        return this.filesService.getUserFiles(userId);
    }

    @Get(':fileId')
    async getFileInfo(@Param('fileId') fileId: string) {
        return this.filesService.getFileInfo(fileId);
    }

    @Delete(':fileId')
    async deleteFile(
        @Param('fileId') fileId: string,
        @Body('userId') userId: string
    ) {
        return this.filesService.deleteFile(fileId, userId);
    }

    @Get('user/:userId/shares')
    async getUserShares(@Param('userId') userId: string) {
        return this.filesService.getUserShares(userId);
    }
}