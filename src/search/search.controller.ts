import { Controller, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from '../common/dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * 搜索接口
   * @param searchDto 搜索参数数据传输对象，包含关键词、搜索类型、分页信息
   * @returns 返回搜索结果，包含匹配的文章、问题或面试题列表
   */
  @Post()
  async search(@Body() searchDto: SearchDto) {
    return this.searchService.search(
      searchDto.keyword,
      searchDto.type,
      searchDto.page,
      searchDto.pageSize,
    );
  }
}
