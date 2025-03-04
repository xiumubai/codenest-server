import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateTagDto, UpdateTagDto } from '../common/dto/tag.dto';

@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  /**
   * 创建标签
   * @param createTagDto 创建标签的数据传输对象
   * @returns 返回创建的标签信息
   */
  @UseGuards(JwtGuard)
  @Post('create')
  async createTag(@Body() createTagDto: CreateTagDto) {
    return this.tagService.createTag(createTagDto.name);
  }

  /**
   * 获取所有标签列表
   * @returns 返回所有标签信息，包括关联的文章数量
   */
  @Get('list')
  async getTagList() {
    return this.tagService.getTagList();
  }

  /**
   * 更新标签信息
   * @param id 标签ID
   * @param updateTagDto 更新标签的数据传输对象
   * @returns 返回更新后的标签信息
   */
  @UseGuards(JwtGuard)
  @Put(':id')
  async updateTag(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTagDto: UpdateTagDto,
  ) {
    return this.tagService.updateTag(id, updateTagDto.name);
  }

  /**
   * 删除标签
   * @param id 标签ID
   * @returns 返回删除操作的结果
   */
  @UseGuards(JwtGuard)
  @Delete(':id')
  async deleteTag(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.deleteTag(id);
  }

  /**
   * 获取标签详情
   * @param id 标签ID
   * @returns 返回标签详细信息，包括关联的文章列表
   */
  @Get(':id')
  async getTagDetail(@Param('id', ParseIntPipe) id: number) {
    return this.tagService.getTagDetail(id);
  }
}
