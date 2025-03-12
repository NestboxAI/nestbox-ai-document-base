// import { Injectable } from '@nestjs/common';
// import { CreateCollectionRequestDTO } from './dto/request/createCollection.request';
// import { CreateDocumentRequestDTO } from './dto/request/createDoc.request';
// import { UpdateDocumentRequestDTO } from './dto/request/updateDoc.request';
// import { DeleteDocsRequestDTO } from './dto/request/deleteDocs.request';
// import { SimilaritySearchQueryDTO } from './dto/request/similaritySearchQuery.request';

// @Injectable()
// export default class CollectionService {
//     constructor() {}

//     async getCollections() {
//         // In a real implementation, you would fetch from a database
//         return [];
//     }

//     async createCollection(body: CreateCollectionRequestDTO) {
//         // In a real implementation, you would save to a database
//         return body;
//     }

//     async deleteCollection(collectionId: string) {
//         // In a real implementation, you would delete from a database
//         return { success: true, collectionId };
//     }

//     async addDocToCollection(collectionId: string, data: CreateDocumentRequestDTO) {
//         // In a real implementation, you would save to a database
//         return { collectionId, documentId: 'doc_' + Date.now(), ...data };
//     }

//     async deleteDocsByMetadata(collectionId: string, data: DeleteDocsRequestDTO) {
//         // In a real implementation, you would query and delete docs from a database
//         // based on the metadata filter
//         return { 
//             success: true, 
//             collectionId, 
//             metadataFilter: data.metadataFilter,
//             deletedCount: 0 
//         };
//     }

//     async getDocById(collectionId: string, docId: string) {
//         // In a real implementation, you would fetch from a database
//         return { 
//             id: docId,
//             collectionId,
//             type: 'document',
//             document: 'Sample document content',
//             url: `https://example.com/collections/${collectionId}/docs/${docId}`,
//             metadata: {
//                 createdAt: new Date().toISOString()
//             }
//         };
//     }

//     async updateDoc(collectionId: string, docId: string, data: UpdateDocumentRequestDTO) {
//         // In a real implementation, you would update in a database
//         return { 
//             id: docId,
//             collectionId,
//             ...data,
//             updatedAt: new Date().toISOString()
//         };
//     }

//     async deleteDoc(collectionId: string, docId: string) {
//         // In a real implementation, you would delete from a database
//         return { 
//             success: true, 
//             collectionId, 
//             documentId: docId 
//         };
//     }

//     async similaritySearch(collectionId: string, data: SimilaritySearchQueryDTO) {
//         // In a real implementation, you would perform a vector similarity search
//         // against documents in your collection
//         const { query, limit = 10, threshold = 0.7, metadataFilter, includeFields } = data;
        
//         // Mock response with sample results
//         return {
//             collectionId,
//             query,
//             results: [
//                 {
//                     id: 'doc_1',
//                     score: 0.95,
//                     document: includeFields?.includes('document') ? 'Sample document 1 content' : undefined,
//                     metadata: {
//                         title: 'Sample Document 1',
//                         createdAt: new Date().toISOString()
//                     }
//                 },
//                 {
//                     id: 'doc_2',
//                     score: 0.85,
//                     document: includeFields?.includes('document') ? 'Sample document 2 content' : undefined,
//                     metadata: {
//                         title: 'Sample Document 2',
//                         createdAt: new Date().toISOString()
//                     }
//                 }
//             ],
//             count: 2,
//             searchParams: {
//                 limit,
//                 threshold,
//                 metadataFilter: metadataFilter || {}
//             }
//         };
//     }
// }



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
            filter || {},
            include
        );
        
        return {
            collectionId,
            query,
            results,
            count: results.length,
            searchParams: {
                ...params,
                filter: filter || {}
            }
        };
    }
}