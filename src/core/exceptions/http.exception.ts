import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

function _prepareBadRequestValidationErrors(errors) {
  const Errors: any = {};
  for (const err of errors) {
    const constraint =
      err.constraints &&
      Object.values(err.constraints) &&
      Object.values(err.constraints).length &&
      Object.values(err.constraints)[0];
    Errors[err.property] = constraint
      ? constraint
      : `${err.property} is invalid`;
  }
  return Errors;
}
@Catch(HttpException, Error)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    if (!(exception instanceof HttpException)) {
      const ResponseToSend = {
        message: 'Internal server error',
      };
      response.__ss_body = ResponseToSend;
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(ResponseToSend);
      return;
    }

    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    if (
      exception instanceof BadRequestException &&
      exceptionResponse.message &&
      Array.isArray(exceptionResponse.message)
    ) {
      const errorFields = exceptionResponse.message
        .map((x) => x.property)
        .join(', ');
      const ResponseToSend = {
        message: `Invalid values provided: ${errorFields}`,
        errors: _prepareBadRequestValidationErrors(exceptionResponse.message),
      };
      response.__ss_body = ResponseToSend;
      response.status(status).json(ResponseToSend);
    } else {
      // Check if the exception has a message property directly
      const message =
        exceptionResponse.message ||
        (typeof exceptionResponse === 'object'
          ? 'An error occurred'
          : exceptionResponse);

      const ResponseToSend = {
        message: message,
        ...(exceptionResponse.data && { data: exceptionResponse.data }),
      };
      response.__ss_body = ResponseToSend;
      response.status(status).json(ResponseToSend);
    }
  }
}
