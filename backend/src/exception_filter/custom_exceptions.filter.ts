import {
  BaseCustomException,
  BaseFirebaseException,
  BaseUnknownException,
  BaseUnknownRelatedException,
} from '@/lib/errors';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch(BaseCustomException)
export class CustomExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
  catch(exception: BaseCustomException, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    // ensure we have a fallback to internal server error
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof BaseUnknownException) {
      statusCode = HttpStatus.NOT_FOUND;
    } else if (exception instanceof BaseFirebaseException) {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
    } else if (exception instanceof BaseUnknownRelatedException) {
      statusCode = HttpStatus.BAD_REQUEST;
    }

    const responseBody = {
      statusCode,
      message: exception.message,
      error: exception.name,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
