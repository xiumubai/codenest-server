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
    isDraft: boolean = false,
  ) {
    const article = await this.prisma.article.create({
      data: {
        title,
        content,
        description,
        cover,
        tags,
        authorId,
        isDraft,
        publishedAt: isDraft ? null : new Date(),
      },
    });

    return article;
  }

  async saveDraft(
    authorId: number,
    title: string,
    content: string,
    description: string,
    cover: string,
    tags: string,
    articleId?: number,
  ) {
    if (articleId) {
      // 检查文章是否存在且属于当前用户
      const existingArticle = await this.prisma.article.findUnique({
        where: { id: articleId },
        include: { draft: true },
      });

      if (!existingArticle) {
        throw new Error('文章不存在');
      }

      if (existingArticle.authorId !== authorId) {
        throw new Error('没有权限修改此文章');
      }

      // 如果已经有草稿，更新草稿
      if (existingArticle.draft) {
        return this.prisma.article.update({
          where: { id: existingArticle.draft.id },
          data: {
            title,
            content,
            description,
            cover,
            tags,
          },
        });
      }

      // 创建新的草稿
      return this.prisma.article.create({
        data: {
          title,
          content,
          description,
          cover,
          tags,
          authorId,
          isDraft: true,
          originalArticle: {
            connect: { id: articleId },
          },
        },
      });
    }

    // 创建新的草稿
    return this.prisma.article.create({
      data: {
        title,
        content,
        description,
        cover,
        tags,
        authorId,
        isDraft: true,
      },
    });
  }

  async publishDraft(authorId: number, draftId: number) {
    const draft = await this.prisma.article.findUnique({
      where: { id: draftId },
      include: { originalArticle: true },
    });

    if (!draft) {
      throw new Error('草稿不存在');
    }

    if (draft.authorId !== authorId) {
      throw new Error('没有权限发布此草稿');
    }

    if (!draft.isDraft) {
      throw new Error('此文章不是草稿');
    }

    // 如果是已发布文章的草稿，更新原文章
    if (draft.originalArticle) {
      const updatedArticle = await this.prisma.article.update({
        where: { id: draft.originalArticle.id },
        data: {
          title: draft.title,
          content: draft.content,
          description: draft.description,
          cover: draft.cover,
          tags: draft.tags,
          publishedAt: new Date(),
          draft: { disconnect: true },
        },
      });

      // 删除草稿
      await this.prisma.article.delete({
        where: { id: draftId },
      });

      return updatedArticle;
    }

    // 如果是新草稿，直接发布
    return this.prisma.article.update({
      where: { id: draftId },
      data: {
        isDraft: false,
        publishedAt: new Date(),
      },
    });
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

  async getArticleDetail(id: number) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!article) {
      throw new Error('文章不存在');
    }

    return article;
  }
}
