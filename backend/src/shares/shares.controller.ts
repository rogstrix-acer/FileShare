import { Controller, Get, Post, Delete, Param, Body, Res, UseGuards, Request } from '@nestjs/common';
import { SharesService } from './shares.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Public } from '../guards/public.decorator';
import { Response } from 'express';

@Controller('shares')
@UseGuards(JwtAuthGuard)
export class SharesController {
    constructor(private sharesService: SharesService) { }

    @Get('my-shares')
    async getUserShares(@Request() req: any) {
        console.log('SharesController: getUserShares - user:', req.user);
        console.log('SharesController: getUserShares - userId:', req.user?.userId);
        return this.sharesService.getUserShares(req.user.userId);
    }

    @Public()
    @Get(':shareToken')
    async getSharedFile(@Param('shareToken') shareToken: string) {
        return this.sharesService.getSharedFile(shareToken);
    }

    @Public()
    @Post(':shareToken/download')
    async downloadSharedFile(
        @Param('shareToken') shareToken: string,
        @Res({ passthrough: true }) res: Response
    ) {
        try {
            const result = await this.sharesService.downloadSharedFile(shareToken);

            if (result.success) {
                // Return the download URL instead of redirecting
                return {
                    success: true,
                    downloadUrl: result.downloadUrl,
                    message: result.message
                };
            } else {
                res.status(404);
                return result;
            }
        } catch (error) {
            res.status(500);
            return {
                success: false,
                message: 'Internal server error'
            };
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