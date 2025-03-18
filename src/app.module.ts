import { Module, Global } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import CollectionModule from './modules/collection/collection.module';
import { HttpExceptionFilter } from './core/exceptions/http.exception';
import AuthGuard from './modules/app/auth.guard';

@Global()
@Module({
  imports: [CollectionModule],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
  exports: [AppService, CollectionModule],
})
export class AppModule {}
