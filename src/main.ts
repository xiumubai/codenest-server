import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  await app.listen(3001);
}
bootstrap();
