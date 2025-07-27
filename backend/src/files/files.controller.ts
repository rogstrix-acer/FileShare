import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Body,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Request
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from './files.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../guards/public.decorator';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
    constructor(private filesService: FilesService) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any
    ) {
        if (!file) {
            return {
                success: false,
                message: 'No file provided'
            };
        }
        return this.filesService.uploadFile(file, req.user.userId);
    }

    @Post(':fileId/share')
    async createShareLink(
        @Param('fileId') fileId: string,
        @Body() shareData: {
            expiresAt?: string;
            maxDownloads?: number;
        },
        @Request() req: any
    ) {
        const expiresAt = shareData.expiresAt ? new Date(shareData.expiresAt) : undefined;
        return this.filesService.createShareLink(fileId, req.user.userId, expiresAt);
    }

    @Get('my-files')
    async getUserFiles(@Request() req: any) {
        return this.filesService.getUserFiles(req.user.userId);
    }


    @Get(':fileId')
    async getFileInfo(@Param('fileId') fileId: string) {
        return this.filesService.getFileInfo(fileId);
    }

    @Delete(':fileId')
    async deleteFile(
        @Param('fileId') fileId: string,
        @Request() req: any
    ) {
        return this.filesService.deleteFile(fileId, req.user.userId);
    }

    @Get('my-shares')
    async getUserShares(@Request() req: any) {
        return this.filesService.getUserShares(req.user.userId);
    }


}