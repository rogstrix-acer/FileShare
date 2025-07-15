import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AppwriteModule } from './appwrite/appwrite.module';
import appwriteConfig from './config/appwrite.config';
import { ConfigModule } from '@nestjs/config';
import { FilesController } from './files/files.controller';
import { SharesController } from './shares/shares.controller';
import { FilesModule } from './files/files.module';
import { SharesModule } from './shares/shares.module';

@Module({
  imports: [AuthModule, AppwriteModule,SharesModule, FilesModule,ConfigModule.forRoot({
    isGlobal: true, // Makes the ConfigModule available globally
    envFilePath: '.env', // Path to your environment variables file
    load: [appwriteConfig]
  }), SharesModule],
  controllers: [AppController, AuthController,FilesController, SharesController],
  providers: [AppService],
})
export class AppModule {}
