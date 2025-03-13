import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import AppConfig from 'src/configs/app.config';
import { UnAuthorizedException } from 'src/core/exceptions/response.exception';

@Injectable()
export default class ApiKeyAuthGuard implements CanActivate {
    constructor(
        private _reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const requiredAuthorization = this._reflector.get<boolean>(
            'authorization',
            context.getHandler(),
        );

        if (requiredAuthorization) {
            const apiKey = request.headers['authorization'];
            const validApiKey = AppConfig.APP.API_KEY
            
            if (!apiKey || apiKey !== validApiKey) {
                throw new UnAuthorizedException();
            }

            request.isAuthorized = true;
        }

        return true;
    }
}