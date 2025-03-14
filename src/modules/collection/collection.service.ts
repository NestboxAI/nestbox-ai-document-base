import { Injectable } from '@nestjs/common';
import { CreateCollectionRequestDTO } from './dto/request/createCollection.request';
import { CreateDocumentRequestDTO } from './dto/request/createDoc.request';
import { UpdateDocumentRequestDTO } from './dto/request/updateDoc.request';
import { DeleteDocsRequestDTO } from './dto/request/deleteDocs.request';
import { SimilaritySearchQueryDTO } from './dto/request/similaritySearchQuery.request';
import { getVectorHandler } from 'src/core/managers/vectorManager';
import { getParserHandler } from 'src/core/managers/parserManager';

@Injectable()
export default class CollectionService {
    constructor() {}

    async getCollections() {
        return await getVectorHandler().listCollections();
    }

    async createCollection(body: CreateCollectionRequestDTO) {
        await getVectorHandler().createCollection(body.name);
        return { success: true, name: body.name };
    }

    async deleteCollection(collectionId: string) {
        await getVectorHandler().deleteCollection(collectionId);
        return { success: true, collectionId };
    }

    async addDocToCollection(collectionId: string, data: CreateDocumentRequestDTO) {
        if ((data.document || data.url) && data.type) {
            const parsedContent = await getParserHandler().parse({
                document: data.document,
                url: data.url,
                type: data.type
            });
            
            data.document = parsedContent;
        }
        
        const docId = await getVectorHandler().insertVector(collectionId, {
            id: data.id,
            document: data.document,
            url: data.url,
            type: data.type,
            metadata: data.metadata
        });
        
        return { 
            success: true,
            collectionId, 
            documentId: docId,
            ...data
        };
    }

    async deleteDocsByMetadata(collectionId: string, data: DeleteDocsRequestDTO) {
        const count = await getVectorHandler().deleteVectorsByFilter(
            collectionId, 
            data.metadataFilter || {}
        );
        
        return { 
            success: true, 
            collectionId, 
            metadataFilter: data.metadataFilter,
            deletedCount: count 
        };
    }

    async getDocById(collectionId: string, docId: string) {
        const doc = await getVectorHandler().getVectorById(collectionId, docId);
        return doc;
    }

    async updateDoc(collectionId: string, docId: string, data: UpdateDocumentRequestDTO) {
        if ((data.document || data.url) && data.type) {
            const parsedContent = await getParserHandler().parse({
                document: data.document,
                url: data.url,
                type: data.type
            });
            
            data.document = parsedContent;
        }
        
        await getVectorHandler().updateVector(
            collectionId, 
            docId, 
            {
                document: data.document,
                url: data.url,
                type: data.type,
                metadata: data.metadata
            }
        );
        
        return { 
            success: true,
            id: docId,
            collectionId,
            ...data,
            updatedAt: new Date().toISOString()
        };
    }

    async deleteDoc(collectionId: string, docId: string) {
        await getVectorHandler().deleteVectorById(collectionId, docId);
        return { 
            success: true, 
            collectionId, 
            documentId: docId 
        };
    }

    async similaritySearch(collectionId: string, data: SimilaritySearchQueryDTO) {
        const { query, params, filter, include } = data;
        
        const topK = params?.topK;
        
        const results = await getVectorHandler().similaritySearch(
            collectionId,
            query,
            topK,
            filter,
            include
        );
        
        return {
            collectionId,
            query,
            results,
            count: results.length,
            searchParams: {
                ...params,
                filter,
            }
        };
    }
}