import { Injectable } from '@nestjs/common';
import { AppwriteService, CreateUserDto, LoginDto } from '../appwrite/appwrite.service';

@Injectable()
export class AuthService {
    constructor(private appwriteService: AppwriteService) {}

    async signup(userData: CreateUserDto) {
        try {
            const user = await this.appwriteService.createUser(userData);
            return {
                success: true,
                message: 'User created successfully',
                user: {
                    id: user.$id,
                    email: user.email,
                    name: user.name,
                    emailVerification: user.emailVerification
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to create user'
            };
        }
    }

    async login(loginData: LoginDto) {
        try {
            const session = await this.appwriteService.createSession(loginData);
            const user = await this.appwriteService.getUser(session.userId);
            
            return {
                success: true,
                message: 'Login successful',
                session: {
                    sessionId: session.$id,
                    userId: session.userId,
                    expire: session.expire
                },
                user: {
                    id: user.$id,
                    email: user.email,
                    name: user.name,
                    emailVerification: user.emailVerification
                }
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Login failed'
            };
        }
    }

    async logout(sessionId?: string) {
        try {
            await this.appwriteService.deleteSession(sessionId);
            return {
                success: true,
                message: 'Logout successful'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Logout failed'
            };
        }
    }

    async getUserProfile(userId: string) {
        try {
            const profile = await this.appwriteService.getUserProfile(userId);
            return {
                success: true,
                profile
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to get user profile'
            };
        }
    }
}
