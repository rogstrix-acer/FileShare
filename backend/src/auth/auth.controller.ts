import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from '../appwrite/appwrite.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

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
}
