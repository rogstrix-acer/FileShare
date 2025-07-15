import { Controller, Get, Post, Delete, Param, Body, Res, UseGuards, Request } from '@nestjs/common';
import { Response } from 'express';
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../guards/public.decorator';

@Controller('shares')
@UseGuards(JwtAuthGuard)
export class SharesController {
    constructor(private sharesService: SharesService) {}

    @Public()
    @Get(':shareToken')
    async getSharedFile(@Param('shareToken') shareToken: string) {
        return this.sharesService.getSharedFile(shareToken);
    }

    @Public()
    @Post(':shareToken/download')
    async downloadSharedFile(
        @Param('shareToken') shareToken: string,
        @Res() res: Response
    ) {
        const result = await this.sharesService.downloadSharedFile(shareToken);
        
        if (result.success) {
            // In a real implementation, you'd stream the file or redirect to download URL
            return res.redirect(result.downloadUrl!);
        } else {
            return res.status(404).json(result);
        }
    }

    @Public()
    @Get(':shareToken/stats')
    async getShareStats(@Param('shareToken') shareToken: string) {
        return this.sharesService.getShareStats(shareToken);
    }

    @Delete(':shareToken')
    async deleteShare(
        @Param('shareToken') shareToken: string,
        @Request() req: any
    ) {
        return this.sharesService.deleteShare(shareToken, req.user.userId);
    }
}