import { Module, forwardRef } from '@nestjs/common';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [ArticleController],
  providers: [ArticleService, PrismaService],
  exports: [ArticleService],
})
export class ArticleModule {}
