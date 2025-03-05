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
    tagId: number,
    isDraft = false,
  ) {
    const article = await this.prisma.article.create({
      data: {
        title,
        content,
        description,
        cover,
        tagId,
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
    description?: string,
    cover?: string,
    tagId?: number,
    articleId?: number,
  ) {
    const draftData = {
      title,
      content,
      authorId,
      isDraft: true,
      description,
      cover,
      tagId,
    };

    if (articleId) {
      // 检查文章是否存在且属于当前用户
      const existingArticle = await this.prisma.article.findUnique({
        where: { id: articleId },
      });

      if (!existingArticle) {
        throw new Error('文章不存在');
      }

      if (existingArticle.authorId !== authorId) {
        throw new Error('没有权限修改此文章');
      }

      // 更新草稿
      return this.prisma.article.update({
        where: { id: articleId },
        data: draftData,
      });
    }

    // 创建新草稿
    return this.prisma.article.create({
      data: draftData,
    });
  }

  async publishDraft(
    authorId: number,
    articleId: number,
    title?: string,
    content?: string,
    description?: string,
    cover?: string,
    tagId?: number,
  ) {
    const draft = await this.prisma.article.findUnique({
      where: { id: articleId },
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

    // 更新文章内容并发布
    return this.prisma.article.update({
      where: { id: articleId },
      data: {
        title: title || draft.title,
        content: content || draft.content,
        description: description || draft.description,
        cover: cover || draft.cover,
        tagId: tagId || draft.tagId,
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
    tagId: number,
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
        tag: { connect: { id: tagId } },
      },
    });

    return article;
  }

  async likeArticle(userId: number, articleId: number) {
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        likes: {
          where: { userId },
        },
      },
    });

    if (!article) {
      throw new Error('文章不存在');
    }

    if (article.likes.length > 0) {
      // 如果已经点赞，则取消点赞
      await this.prisma.$transaction([
        this.prisma.like.delete({
          where: {
            userId_articleId: {
              userId,
              articleId,
            },
          },
        }),
        this.prisma.article.update({
          where: { id: articleId },
          data: {
            likeCount: {
              decrement: 1,
            },
          },
        }),
      ]);

      return {
        liked: false,
        likeCount: article.likeCount - 1,
      };
    } else {
      // 如果未点赞，则添加点赞
      await this.prisma.$transaction([
        this.prisma.like.create({
          data: {
            userId,
            articleId,
          },
        }),
        this.prisma.article.update({
          where: { id: articleId },
          data: {
            likeCount: {
              increment: 1,
            },
          },
        }),
      ]);

      return {
        liked: true,
        likeCount: article.likeCount + 1,
      };
    }
  }

  async getArticleList(
    page = 1,
    pageSize = 10,
    tagId?: number,
    userId?: number,
  ) {
    const skip = (page - 1) * pageSize;

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
        skip,
        take: pageSize,
        where: {
          isDraft: false,
          tagId: tagId && tagId,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          tag: true,
          likes: userId
            ? {
                where: { userId },
                select: { userId: true },
              }
            : false,
        },
      }),
      this.prisma.article.count(),
    ]);

    return {
      items: articles.map((article) => ({
        ...article,
        liked: article.likes ? article.likes.length > 0 : false,
        likes: undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getArticleDetail(id: number, userId?: number) {
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
        likes: userId
          ? {
              where: { userId },
              select: { userId: true },
            }
          : false,
      },
    });

    if (!article) {
      throw new Error('文章不存在');
    }

    return {
      ...article,
      liked: article.likes ? article.likes.length > 0 : false,
      likes: undefined,
    };
  }

  async getDrafts(authorId: number, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    const drafts = await this.prisma.article.findMany({
      where: {
        authorId,
        isDraft: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        cover: true,
        tagId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      skip,
      take: pageSize,
    });

    const total = await this.prisma.article.count({
      where: {
        authorId,
        isDraft: true,
      },
    });

    return {
      drafts,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
