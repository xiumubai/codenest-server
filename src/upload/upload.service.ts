import { Injectable } from '@nestjs/common';
import * as COS from 'cos-nodejs-sdk-v5';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private cos: COS;

  constructor(private configService: ConfigService) {
    this.cos = new COS({
      SecretId: this.configService.get('NEXT_PUBLIC_TENCENT_SECRET_ID'),
      SecretKey: this.configService.get('NEXT_PUBLIC_TENCENT_SECRET_KEY'),
    });
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new Error('未接收到文件');
    }

    if (!file.originalname || !file.buffer) {
      throw new Error('文件格式不正确');
    }

    const fileName = `${Date.now()}-${file.originalname}`;
    const bucket = this.configService.get('NEXT_PUBLIC_TENCENT_BUCKET');
    const region = this.configService.get('NEXT_PUBLIC_TENCENT_REGION');

    if (!bucket || !region) {
      throw new Error('腾讯云配置不完整');
    }

    try {
      const result = await this.cos.putObject({
        Bucket: bucket,
        Region: region,
        Key: fileName,
        Body: file.buffer,
      });

      if (result.statusCode === 200) {
        return {
          url: `https://${bucket}.cos.${region}.myqcloud.com/${fileName}`,
          filename: file.originalname,
          mimetype: file.mimetype,
          size: file.size.toString(),
        };
      }

      throw new Error('文件上传失败');
    } catch (error) {
      console.error('文件上传错误:', error);
      throw new Error('文件上传失败: ' + error.message);
    }
  }

  async uploadFiles(files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) => this.uploadFile(file));
    const results = await Promise.all(uploadPromises);
    return { files: results };
  }
}
