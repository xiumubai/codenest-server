import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
  Param,
  ParseIntPipe,
  Get,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtGuard)
  @Post('create')
  async createArticle(
    @Request() req,
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('description') description: string,
    @Body('cover') cover: string,
    @Body('tags') tags: string,
  ) {
    return this.articleService.createArticle(
      req.user.id,
      title,
      content,
      description,
      cover,
      tags,
    );
  }

  @Post('list')
  async getArticleList(
    @Body('page', ParseIntPipe) page = 1,
    @Body('pageSize', ParseIntPipe) pageSize = 10,
    @Body('tags') tags?: string,
  ) {
    return this.articleService.getArticleList(page, pageSize, tags);
  }

  @UseGuards(JwtGuard)
  @Put('update')
  async updateArticle(
    @Request() req,
    @Body('id', ParseIntPipe) id: number,
    @Body('title') title: string,
    @Body('content') content: string,
    @Body('description') description: string,
    @Body('cover') cover: string,
    @Body('tags') tags: string,
  ) {
    return this.articleService.updateArticle(
      id,
      req.user.id,
      title,
      content,
      description,
      cover,
      tags,
    );
  }

  @Get(':id')
  async getArticleDetail(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.getArticleDetail(id);
  }
}
