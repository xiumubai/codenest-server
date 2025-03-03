import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(
    keyword: string,
    type: 'article' | 'question' | 'interview',
    page = 1,
    pageSize = 10,
  ) {
    const skip = (page - 1) * pageSize;
    let items = [];
    let total = 0;

    switch (type) {
      case 'article':
        [items, total] = await Promise.all([
          this.prisma.article.findMany({
            where: {
              OR: [
                { title: { contains: keyword } },
                { content: { contains: keyword } },
                { description: { contains: keyword } },
              ],
            },
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
          this.prisma.article.count({
            where: {
              OR: [
                { title: { contains: keyword } },
                { content: { contains: keyword } },
                { description: { contains: keyword } },
              ],
            },
          }),
        ]);
        break;
      // 后续可以添加其他类型的搜索
      case 'question':
      case 'interview':
        // 待实现问题和面试题的搜索逻辑
        break;
    }

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
