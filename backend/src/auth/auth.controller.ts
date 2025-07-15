import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from '../appwrite/appwrite.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('signup')
    async signup(@Body() userData: CreateUserDto) {
        return this.authService.signup(userData);
    }

    @Post('login')
    async login(@Body() loginData: LoginDto) {
        return this.authService.login(loginData);
    }

    @Post('logout')
    async logout(@Body() body?: { sessionId?: string }) {
        return this.authService.logout(body?.sessionId);
    }

    @Get('profile/:userId')
    async getUserProfile(@Param('userId') userId: string) {
        return this.authService.getUserProfile(userId);
    }

    @Put('profile/:userId')
    async updateUserProfile(
        @Param('userId') userId: string,
        @Body() profileData: any
    ) {
        return this.authService.updateUserProfile(userId, profileData);
    }

    @Get('user/email')
    async getUserByEmail(@Query('email') email: string) {
        return this.authService.getUserByEmail(email);
    }

    @Get('user/:userId')
    async getUser(@Param('userId') userId: string) {
        return this.authService.getUser(userId);
    }

    @Put('user/:userId')
    async updateUser(
        @Param('userId') userId: string,
        @Body() updateData: Partial<CreateUserDto>
    ) {
        return this.authService.updateUser(userId, updateData);
    }

    @Delete('user/:userId')
    async deleteUser(@Param('userId') userId: string) {
        return this.authService.deleteUser(userId);
    }

    @Post('password/reset')
    async resetPassword(
        @Body() resetData: { userId: string; otp: string; newPassword: string }
    ) {
        return this.authService.resetPassword(resetData.userId, resetData.otp, resetData.newPassword);
    }

    @Post('session/verify')
    async verifySession(@Body() body: { sessionId: string }) {
        return this.authService.verifySession(body.sessionId);
    }
}
