import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: '文章ID不能为空' })
  @IsNumber({}, { message: '文章ID必须是数字' })
  articleId: number;

  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString({ message: '评论内容必须是字符串' })
  content: string;

  @IsOptional()
  @IsNumber({}, { message: '父评论ID必须是数字' })
  parentId?: number;
}
