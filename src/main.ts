import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 设置全局路由前缀
  app.setGlobalPrefix('api');

  // 启用 CORS
  app.enableCors({
    origin: ['http://localhost:3000', 'https://codenest.com'], // 允许所有来源
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // 允许发送认证信息（cookies等）
    allowedHeaders: 'Content-Type,Accept,Authorization',
  });

  // 全局注册拦截器
  app.useGlobalInterceptors(new TransformInterceptor());
  // 全局注册异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());
  // 配置请求体大小限制
  app.use(express.json({ limit: '50mb' }));

  await app.listen(3001);
}
bootstrap();
