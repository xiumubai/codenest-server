import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import {
  UploadFileResponseDto,
  UploadFilesResponseDto,
} from '../common/dto/upload.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  /**
   * 上传单个文件
   * @param file 上传的文件对象
   * @returns {Promise<UploadFileResponseDto>} 返回上传成功的文件信息，包括URL、文件名、类型和大小
   */
  @Post('single')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFileResponseDto> {
    return this.uploadService.uploadFile(file);
  }

  /**
   * 批量上传多个文件
   * @param files 上传的文件对象数组
   * @returns {Promise<UploadFilesResponseDto>} 返回上传成功的所有文件信息数组
   */
  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<UploadFilesResponseDto> {
    return this.uploadService.uploadFiles(files);
  }
}
