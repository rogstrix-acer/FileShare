import { BadRequestException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Account, Client, Databases, ID, Query, Users, Storage } from "node-appwrite";
import { InputFile } from "node-appwrite/dist/inputFile";


export interface AppwriteUser {
    $id: string;
    name: string;
    email: string;
    emailVerification: boolean;
    phone?: string;
    prefs: any;
    registration: string;
    status: boolean;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name?: string;
}

export interface LoginDto {
    email: string;
    password: string;
}

@Injectable()
export class AppwriteService {
    private readonly logger = new Logger(AppwriteService.name);
    private client: Client;
    private account: Account;
    private databases: Databases;
    private users: Users;
    private projectId: string;
    private databaseId: string;
    private userCollectionId: string;
    private bucketId: string;
    public storage: Storage;

    constructor(private configService: ConfigService) {
        this.projectId = this.configService.get<string>('appwrite.projectId') || 'projectId';
        this.databaseId = this.configService.get<string>('appwrite.databaseId') || 'main';
        this.userCollectionId = this.configService.get<string>(
            'appwrite.userCollectionId',
        ) || 'users';

        this.bucketId = this.configService.get<string>(
            'appwrite.bucketId',
        ) || ''

        // console.log(this.projectId)

        this.client = new Client()
            .setEndpoint(this.configService.get<string>('appwrite.endpoint') || 'https://cloud.appwrite.io/v1')
            .setProject(this.projectId)
            .setKey(this.configService.get<string>('appwrite.apiKey') || '');

        this.account = new Account(this.client);
        this.databases = new Databases(this.client);
        this.users = new Users(this.client);
        this.storage = new Storage(this.client);

        this.logger.log('Appwrite service initialized');
    }

    async createUser(userData: CreateUserDto): Promise<AppwriteUser> {
        try {
            const user = await this.users.create(
                ID.unique(),
                userData.email,
                undefined,
                userData.password,
                userData.name,
            );

            // Create user profile in database
            await this.createUserProfile(user.$id, {
                user_id: user.$id,
                email: userData.email,
                name: userData.name || 'User',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            });

            this.logger.log(`User created: ${user.$id}`);
            return user;
        } catch (error) {
            this.logger.error('Error creating user:', error);
            throw new BadRequestException('Failed to create user: ' + error.message);
        }
    }

    async createSession(loginData: LoginDto): Promise<any> {
        try {

            // Create email/password session
            const session = await this.account.createEmailPasswordSession(
                loginData.email,
                loginData.password,
            );

            this.logger.log(`Session created for user: ${session.userId}`);
            return session;
        } catch (error) {
            this.logger.error('Error creating session:', error);
            throw new UnauthorizedException('Invalid credentials');
        }
    }

    async getUser(userId: string): Promise<AppwriteUser> {
        try {
            this.logger.debug(`Getting user from Appwrite: ${userId}`);
            const user = await this.users.get(userId);
            this.logger.debug(`User retrieved from Appwrite:`, {
                id: user.$id,
                email: user.email,
                status: user.status,
                name: user.name,
            });
            return user;
        } catch (error) {
            this.logger.error(
                `Error getting user ${userId} from Appwrite:`,
                error.message,
            );
            throw new UnauthorizedException('User not found');
        }
    }

    async getUserByEmail(email: string): Promise<AppwriteUser | null> {
        try {
            const users = await this.users.list([Query.equal('email', email)]);
            return users.users.length > 0 ? users.users[0] : null;
        } catch (error) {
            this.logger.error('Error getting user by email:', error);
            return null;
        }
    }

    async updateUser(
        userId: string,
        updateData: Partial<CreateUserDto>,
    ): Promise<AppwriteUser> {
        try {
            const user = await this.users.updateName(userId, updateData.name!);
            if (updateData.email) {
                await this.users.updateEmail(userId, updateData.email);
            }
            return user;
        } catch (error) {
            this.logger.error('Error updating user:', error);
            throw new BadRequestException('Failed to update user');
        }
    }

    // Confirm password recovery using OTP (Appwrite)
    async confirmPasswordRecovery(
        userId: string,
        otp: string,
        newPassword: string,
    ): Promise<void> {
        try {
            await this.users.updatePassword(userId, newPassword);

            this.logger.log(`Password updated for user: ${userId}`);
        } catch (error) {
            this.logger.error('Failed to confirm password recovery:', error);
            this.logger.error('Error details:', error.message || error);
            throw new BadRequestException(
                'Failed to reset password: ' + (error.message || error),
            );
        }
    }

    async deleteUser(userId: string): Promise<void> {
        try {
            await this.users.delete(userId);
            await this.databases.deleteDocument(
                this.databaseId,
                this.userCollectionId,
                userId,
            );
            this.logger.log(`User deleted: ${userId}`);
        } catch (error) {
            this.logger.error('Error deleting user:', error);
            throw new BadRequestException('Failed to delete user');
        }
    }

    async verifySession(sessionId: string): Promise<any> {
        try {
            // For server-side usage, session verification is handled by JWT tokens
            // This method is kept for compatibility but doesn't perform actual verification
            this.logger.log(`Session verification requested: ${sessionId}`);
            return { valid: true, sessionId };
        } catch (error) {
            this.logger.error('Error verifying session:', error);
            throw new UnauthorizedException('Invalid session');
        }
    }

    async deleteSession(sessionId?: string): Promise<void> {
        try {
            // For server-side usage, session deletion is handled by JWT invalidation
            // No actual session to delete in Appwrite since we're using JWT tokens
            this.account.deleteSession(
                sessionId || 'current',
            );
            this.logger.log(`Session logout requested: ${sessionId || 'current'}`);
        } catch (error) {
            this.logger.error('Error deleting session:', error);
            // Don't throw error on logout - always allow logout to complete
        }
    }

    async createUserProfile(userId: string, profileData: any): Promise<any> {
        try {
            const document = await this.databases.createDocument(
                this.databaseId,
                this.userCollectionId,
                userId,
                profileData,
            );
            return document;
        } catch (error) {
            this.logger.error('Error creating user profile:', error);
            throw new BadRequestException('Failed to create user profile');
        }
    }

    async getUserProfile(userId: string): Promise<any> {
        try {
            const document = await this.databases.getDocument(
                this.databaseId,
                this.userCollectionId,
                userId,
            );
            return document;
        } catch (error) {
            this.logger.error('Error getting user profile:', error);
            return null;
        }
    }

    async updateUserProfile(userId: string, profileData: any): Promise<any> {
        try {
            profileData.updated_at = new Date().toISOString();
            const document = await this.databases.updateDocument(
                this.databaseId,
                this.userCollectionId,
                userId,
                profileData,
            );
            return document;
        } catch (error) {
            this.logger.error('Error updating user profile:', error);
            throw new BadRequestException('Failed to update user profile');
        }
    }

    async uploadFile(file: Express.Multer.File, userId: string) {
        try {
            const fileId = ID.unique();
            const uploadedFile = await this.storage.createFile(
                this.bucketId,
                fileId,
                InputFile.fromBuffer(file.buffer, file.originalname)
            );

            // Store file metadata in database
            await this.createFileRecord(uploadedFile.$id, file, userId);

            return { success: true, fileId: uploadedFile.$id };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async createShareLink(fileId: string, expiresAt?: Date) {
        const shareToken = ID.unique();

        // Store share record in Appwrite database
        await this.databases.createDocument(
            this.databaseId,
            'shares', // collection ID
            ID.unique(),
            {
                fileId,
                shareToken,
                expiresAt: expiresAt?.toISOString(),
                downloadCount: 0,
                createdAt: new Date().toISOString()
            }
        );

        const baseUrl = this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
        return `${baseUrl}/share/${shareToken}`;
    }

    private async createFileRecord(fileId: string, file: Express.Multer.File, userId: string) {
        return this.databases.createDocument(
            this.databaseId,
            'files', // collection ID
            ID.unique(),
            {
                fileId,
                originalName: file.originalname,
                size: file.size,
                mimeType: file.mimetype,
                userId,
                createdAt: new Date().toISOString()
            }
        );
    }

}