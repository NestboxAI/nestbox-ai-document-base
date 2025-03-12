import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export const Authorized = () => {
    let authorizedRoles = [];
    return applyDecorators(
        SetMetadata('roles', authorizedRoles),
        SetMetadata('authorization', true),
        ApiSecurity('authorization'),
    );
};
