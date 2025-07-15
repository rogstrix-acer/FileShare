import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { SharesModule } from './shares/shares.module';
import { AppwriteModule } from './appwrite/appwrite.module';
import appwriteConfig from './config/appwrite.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appwriteConfig]
    }),
    AppwriteModule,
    AuthModule,
    FilesModule,
    SharesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
