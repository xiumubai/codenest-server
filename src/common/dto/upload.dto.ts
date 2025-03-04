import { IsString } from 'class-validator';

export class UploadFileResponseDto {
  @IsString()
  url: string;

  @IsString()
  filename: string;

  @IsString()
  mimetype: string;

  @IsString()
  size: string;
}

export class UploadFilesResponseDto {
  files: UploadFileResponseDto[];
}
