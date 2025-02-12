import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseCode } from '../interfaces/response.interface';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = 'error';
    if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const errMessage = (exceptionResponse as { message: string | string[] })
        .message;
      message = Array.isArray(errMessage) ? errMessage[0] : errMessage;
    }

    response.status(status).json({
      code: ResponseCode.ERROR,
      message: message,
      data: null,
    });
  }
}
