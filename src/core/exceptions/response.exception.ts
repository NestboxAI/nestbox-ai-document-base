import { HttpException, HttpStatus } from "@nestjs/common";

export class NotFoundException extends HttpException {
  constructor(message: string = "Resource not found", data?: any) {
    super({ message, ...(data && { data }) }, HttpStatus.NOT_FOUND);
  }
}

export class UnAuthorizedException extends HttpException {
  constructor(message: string = "Unauthorized resource", data?: any) {
    super({ message, ...(data && { data }) }, HttpStatus.UNAUTHORIZED);
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string = "Bad request", data?: any) {
    super({ message, ...(data && { data }) }, HttpStatus.BAD_REQUEST);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = "Access forbidden", data?: any) {
    super({ message, ...(data && { data }) }, HttpStatus.FORBIDDEN);
  }
}

export class FatalErrorException extends HttpException {
  constructor(message: string = "Internal server error", data?: any) {
    super({ message, ...(data && { data }) }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class WebSocketException extends HttpException {
  constructor(message: string = 'WebSocket error', data?: any) {
    super({ message, ...(data && { data }) }, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}