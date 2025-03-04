import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  description: string;

  @IsString()
  cover: string;

  @IsNumber()
  tagId: number;

  @IsOptional()
  @IsBoolean()
  isDraft?: boolean = false;
}

export class SaveDraftDto extends CreateArticleDto {
  @IsOptional()
  @IsInt()
  id?: number;
}

export class PublishDraftDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  cover?: string;

  @IsOptional()
  @IsNumber()
  tagId: number;
}

export class UpdateArticleDto extends CreateArticleDto {
  @IsInt()
  id: number;
}

export class GetArticleListDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number = 10;

  @IsOptional()
  @IsNumber()
  tagId: number;
}
