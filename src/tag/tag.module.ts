import { Module, forwardRef } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [TagController],
  providers: [TagService, PrismaService],
  exports: [TagService],
})
export class TagModule {}
