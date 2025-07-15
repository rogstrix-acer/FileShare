import { Module } from '@nestjs/common';
import { SharesController } from './shares.controller';
import { SharesService } from './shares.service';
import { AppwriteModule } from '../appwrite/appwrite.module';

@Module({
    imports: [AppwriteModule],
    controllers: [SharesController],
    providers: [SharesService],
    exports: [SharesService]
})
export class SharesModule {}