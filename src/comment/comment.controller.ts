import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateCommentDto } from '../common/dto/comment.dto';

@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Post()
  @UseGuards(JwtGuard)
  async createComment(
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    console.log(createCommentDto);
    return this.commentService.createComment(
      req.user.id,
      createCommentDto.articleId,
      createCommentDto.content,
      createCommentDto.parentId,
    );
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  async deleteComment(@Request() req, @Param('id') id: string) {
    return this.commentService.deleteComment(+id, req.user.id);
  }

  @Get(':articleId')
  async getComments(
    @Param('articleId') articleId: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.commentService.getComments(
      +articleId,
      page ? +page : 1,
      pageSize ? +pageSize : 10,
    );
  }
}
