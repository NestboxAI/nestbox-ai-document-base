import { createParamDecorator } from '@nestjs/common';

export const CurrentUser = createParamDecorator((data, context) => {
  const request = context.switchToHttp().getRequest();
  return request.isAuthorized ? request.isAuthorized : null;
});
