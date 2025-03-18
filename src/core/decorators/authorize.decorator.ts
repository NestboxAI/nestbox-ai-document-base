import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export const Authorized = () => {
  return applyDecorators(
    SetMetadata('authorization', true),
    ApiSecurity('authorization'),
  );
};
