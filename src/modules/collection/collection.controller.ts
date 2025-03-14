import { Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import CollectionService from './collection.service';
import { ApiController, Authorized, Delete, Get, Post, Put } from 'src/core/decorators';
import { CreateCollectionRequestDTO } from './dto/request/createCollection.request';
import { CreateDocumentRequestDTO } from './dto/request/createDoc.request';
import { UpdateDocumentRequestDTO } from './dto/request/updateDoc.request';
import { DeleteDocsRequestDTO } from './dto/request/deleteDocs.request';
import { SimilaritySearchQueryDTO } from './dto/request/similaritySearchQuery.request';
import MessageResponseDTO from './dto/response/message.response';

@ApiController({ version: '1', tag: 'collection' })
export default class CollectionController {
    constructor(private _collectionService: CollectionService) {}

    @Authorized()
    @Get({
        path: '/collections',
        description: 'List all collections',
        response: MessageResponseDTO
    })
    async getCollections() {
        return await this._collectionService.getCollections();
    }

    @Authorized()
    @Post({
        path: '/collections',
        description: 'Create a new collection',
        response: MessageResponseDTO
    })
    async createCollection(
        @Body() data: CreateCollectionRequestDTO
    ) {
        return await this._collectionService.createCollection(data);
    }

    @Authorized()
    @Delete({
        path: '/collections/:collection_id',
        description: 'Delete a collection',
        response: MessageResponseDTO
    })
    async deleteCollection(
        @Param('collection_id') collectionId: string
    ) {
        return await this._collectionService.deleteCollection(collectionId);
    }

    @Authorized()
    @Post({
        path: '/collections/:collection_id/docs',
        description: 'Add a new doc',
        response: MessageResponseDTO
    })
    async addDocToCollection(
        @Param('collection_id') collectionId: string,
        @Body() data: CreateDocumentRequestDTO
    ) {
        return await this._collectionService.addDocToCollection(collectionId, data);
    }

    @Authorized()
    @Delete({
        path: '/collections/:collection_id/docs',
        description: 'Delete docs based on metadata filter',
        response: MessageResponseDTO
    })
    async deleteDocsByMetadata(
        @Param('collection_id') collectionId: string,
        @Query('filter') filter: string
    ) {
        const parsedFilter = filter ? JSON.parse(filter) : {};
        return await this._collectionService.deleteDocsByMetadata(collectionId, { metadataFilter: parsedFilter });
    }

    @Authorized()
    @Get({
        path: '/collections/:collection_id/docs/:doc_id',
        description: 'Retrieve doc by ID',
        response: MessageResponseDTO
    })
    async getDocById(
        @Param('collection_id') collectionId: string,
        @Param('doc_id') docId: string
    ) {
        return await this._collectionService.getDocById(collectionId, docId);
    }

    @Authorized()
    @Put({
        path: '/collections/:collection_id/docs/:doc_id',
        description: 'Update or upsert doc',
        response: MessageResponseDTO
    })
    async updateDoc(
        @Param('collection_id') collectionId: string,
        @Param('doc_id') docId: string,
        @Body() data: UpdateDocumentRequestDTO
    ) {
        return await this._collectionService.updateDoc(collectionId, docId, data);
    }

    @Authorized()
    @Delete({
        path: '/collections/:collection_id/docs/:doc_id',
        description: 'Delete doc by ID',
        response: MessageResponseDTO
    })
    async deleteDoc(
        @Param('collection_id') collectionId: string,
        @Param('doc_id') docId: string
    ) {
        return await this._collectionService.deleteDoc(collectionId, docId);
    }

    @Authorized()
    @Post({
        path: '/collections/:collection_id/query',
        description: 'Similarity search query',
        response: MessageResponseDTO
    })
    async similaritySearch(
        @Param('collection_id') collectionId: string,
        @Body() data: SimilaritySearchQueryDTO
    ) {
        return await this._collectionService.similaritySearch(collectionId, data);
    }
}