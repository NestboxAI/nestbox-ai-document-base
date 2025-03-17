import { Module } from '@nestjs/common';
import CollectionService from './collection.service';
import CollectionController from './collection.controller';

@Module({
    imports: [],
    exports: [CollectionService],
    providers: [CollectionService],
    controllers: [CollectionController],
})
export default class CollectionModule { }
