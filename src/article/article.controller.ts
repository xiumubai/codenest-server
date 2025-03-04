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
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { JwtGuard } from '../auth/jwt.guard';
import {
  CreateArticleDto,
  SaveDraftDto,
  PublishDraftDto,
  UpdateArticleDto,
  GetArticleListDto,
} from '../common/dto/article.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  /**
   * 创建文章
   * @param req 请求对象，包含用户信息
   * @param createArticleDto 创建文章的数据传输对象
   * @returns 返回创建的文章信息
   */
  @UseGuards(JwtGuard)
  @Post('create')
  async createArticle(
    @Request() req,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.articleService.createArticle(
      req.user.id,
      createArticleDto.title,
      createArticleDto.content,
      createArticleDto.description,
      createArticleDto.cover,
      createArticleDto.tagId,
      createArticleDto.isDraft,
    );
  }

  /**
   * 保存文章草稿
   * @param req 请求对象，包含用户信息
   * @param saveDraftDto 保存草稿的数据传输对象
   * @returns 返回保存的草稿信息
   */
  @UseGuards(JwtGuard)
  @Post('save-draft')
  async saveDraft(@Request() req, @Body() saveDraftDto: SaveDraftDto) {
    return this.articleService.saveDraft(
      req.user.id,
      saveDraftDto.title,
      saveDraftDto.content,
      saveDraftDto.description,
      saveDraftDto.cover,
      saveDraftDto.tagId,
      saveDraftDto.id,
    );
  }

  /**
   * 发布草稿为正式文章
   * @param req 请求对象，包含用户信息
   * @param publishDraftDto 发布草稿的数据传输对象
   * @returns 返回发布后的文章信息
   */
  @UseGuards(JwtGuard)
  @Post('publish-draft')
  async publishDraft(@Request() req, @Body() publishDraftDto: PublishDraftDto) {
    return this.articleService.publishDraft(
      req.user.id,
      publishDraftDto.id,
      publishDraftDto.title,
      publishDraftDto.content,
      publishDraftDto.description,
      publishDraftDto.cover,
      publishDraftDto.tagId,
    );
  }

  /**
   * 获取文章列表
   * @param getArticleListDto 获取文章列表的数据传输对象，包含分页和标签过滤信息
   * @returns 返回分页后的文章列表数据
   */
  @Post('list')
  async getArticleList(@Body() getArticleListDto: GetArticleListDto) {
    return this.articleService.getArticleList(
      getArticleListDto.page,
      getArticleListDto.pageSize,
      getArticleListDto.tagId,
    );
  }

  /**
   * 更新文章信息
   * @param req 请求对象，包含用户信息
   * @param updateArticleDto 更新文章的数据传输对象
   * @returns 返回更新后的文章信息
   */
  @UseGuards(JwtGuard)
  @Put('update')
  async updateArticle(
    @Request() req,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.updateArticle(
      updateArticleDto.id,
      req.user.id,
      updateArticleDto.title,
      updateArticleDto.content,
      updateArticleDto.description,
      updateArticleDto.cover,
      updateArticleDto.tagId,
    );
  }

  /**
   * 获取文章详情
   * @param id 文章ID
   * @returns 返回文章的详细信息
   */
  @Get(':id')
  async getArticleDetail(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.getArticleDetail(id);
  }

  /**
   * 获取草稿列表
   * @param page 页码
   * @param pageSize 每页数量
   * @returns 返回草稿列表
   */
  @Get('drafts')
  @UseGuards(JwtGuard)
  async getDrafts(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.articleService.getDrafts(req.user.id, page, pageSize);
  }
}
