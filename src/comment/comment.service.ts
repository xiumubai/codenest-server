import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prisma: PrismaService) {}

  async createComment(
    authorId: number,
    articleId: number,
    content: string,
    parentId?: number,
  ) {
    // 验证文章是否存在
    const article = await this.prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      throw new BadRequestException('文章不存在');
    }

    // 如果是回复评论，验证父评论是否存在
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });

      if (!parentComment) {
        throw new BadRequestException('父评论不存在');
      }

      if (parentComment.articleId !== articleId) {
        throw new BadRequestException('父评论不属于该文章');
      }
    }

    // 创建评论并更新文章评论数
    const [comment] = await this.prisma.$transaction([
      this.prisma.comment.create({
        data: {
          content,
          authorId,
          articleId,
          parentId,
        },
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
      this.prisma.article.update({
        where: { id: articleId },
        data: {
          commentCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return comment;
  }

  async deleteComment(commentId: number, userId: number) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new BadRequestException('评论不存在');
    }

    if (comment.authorId !== userId) {
      throw new BadRequestException('没有权限删除此评论');
    }

    // 删除评论并更新文章评论数
    await this.prisma.$transaction([
      this.prisma.comment.delete({
        where: { id: commentId },
      }),
      this.prisma.article.update({
        where: { id: comment.articleId },
        data: {
          commentCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: '评论删除成功' };
  }

  async getComments(articleId: number, page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: {
          articleId,
          parentId: null, // 只获取顶级评论
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              author: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.comment.count({
        where: {
          articleId,
          parentId: null,
        },
      }),
    ]);

    return {
      items: comments,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
