import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AppwriteModule } from './appwrite/appwrite.module';
import appwriteConfig from './config/appwrite.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, AppwriteModule,ConfigModule.forRoot({
    isGlobal: true, // Makes the ConfigModule available globally
    envFilePath: '.env', // Path to your environment variables file
    load: [appwriteConfig]
  })],
  controllers: [AppController, AuthController],
  providers: [AppService],
})
export class AppModule {}
