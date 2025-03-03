import { Controller, Post, Body } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from '../common/dto/search.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

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
