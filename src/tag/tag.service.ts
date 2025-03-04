import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  async createTag(name: string) {
    return this.prisma.tag.create({
      data: { name },
    });
  }

  async getTagList() {
    const tags = await this.prisma.tag.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    return tags.map((tag) => ({
      ...tag,
      articleCount: tag._count.articles,
      _count: undefined,
    }));
  }

  async updateTag(id: number, name: string) {
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      throw new Error('标签不存在');
    }

    return this.prisma.tag.update({
      where: { id },
      data: { name },
    });
  }

  async deleteTag(id: number) {
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!existingTag) {
      throw new Error('标签不存在');
    }

    if (existingTag._count.articles > 0) {
      throw new Error('该标签下还有关联的文章，无法删除');
    }

    return this.prisma.tag.delete({
      where: { id },
    });
  }

  async getTagDetail(id: number) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        articles: {
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
    });

    if (!tag) {
      throw new Error('标签不存在');
    }

    return tag;
  }
}
