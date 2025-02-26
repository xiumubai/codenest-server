import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async createArticle(
    authorId: number,
    title: string,
    content: string,
    description: string,
    cover: string,
    tags: string,
  ) {
    const article = await this.prisma.article.create({
      data: {
        title,
        content,
        description,
        cover,
        tags,
        authorId,
      },
    });

    return article;
  }

  async updateArticle(
    articleId: number,
    authorId: number,
    title: string,
    content: string,
    description: string,
    cover: string,
    tags: string,
  ) {
    // 验证文章是否存在且属于当前用户
    const existingArticle = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!existingArticle) {
      throw new Error('文章不存在');
    }

    if (existingArticle.authorId !== authorId) {
      throw new Error('没有权限修改此文章');
    }

    // 更新文章
    const article = await this.prisma.article.update({
      where: { id: articleId },
      data: {
        title,
        content,
        description,
        cover,
        tags,
      },
    });

    return article;
  }

  async getArticleList(page = 1, pageSize = 10, tags?: string) {
    const skip = (page - 1) * pageSize;

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.article.count(),
    ]);

    return {
      items: articles,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
