import { IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';

export enum SearchType {
  ARTICLE = 'article',
  QUESTION = 'question',
  INTERVIEW = 'interview',
}

export class SearchDto {
  @IsString()
  keyword: string;

  @IsEnum(SearchType)
  type: SearchType;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number = 10;
}
