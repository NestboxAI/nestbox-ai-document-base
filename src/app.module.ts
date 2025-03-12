import { Module, Global } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranslatorModule } from 'nestjs-translator';
import CollectionModule from './modules/collection/collection.module';
import { HttpExceptionFilter } from './core/exceptions/http.exception';

@Global() // Make this module global so its providers are available throughout the app
@Module({
    imports: [
        TranslatorModule.forRoot({
            defaultLang: 'en',
            global: true,
            requestKeyExtractor(req) {
                return req.headers['locale'];
            },
            translationSource: './dist/i18n',
        }),
        CollectionModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
    ],
    exports: [
        AppService,
        CollectionModule,
    ]
})
export class AppModule {}