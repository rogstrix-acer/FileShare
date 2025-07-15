import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { SharesModule } from './shares/shares.module';
import { AppwriteModule } from './appwrite/appwrite.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
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
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
