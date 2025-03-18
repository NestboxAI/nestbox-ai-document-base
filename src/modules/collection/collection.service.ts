import { CreateCollectionRequestDTO } from './dto/request/createCollection.request';
import { CreateDocumentRequestDTO } from './dto/request/createDoc.request';
import { UpdateDocumentRequestDTO } from './dto/request/updateDoc.request';
import { DeleteDocsRequestDTO } from './dto/request/deleteDocs.request';
import { SimilaritySearchQueryDTO } from './dto/request/similaritySearchQuery.request';
import { getVectorHandler } from 'src/core/managers/vectorManager';
import { getParserHandler } from 'src/core/managers/parserManager';
import { Injectable } from '@nestjs/common';
import {
  BadRequestException,
  NotFoundException,
} from 'src/core/exceptions/response.exception';

@Injectable()
export default class CollectionService {
  constructor() {}

  async getCollections() {
    try {
      return await getVectorHandler().listCollections();
    } catch (error) {
      this.handleError(error, 'Failed to retrieve collections');
    }
  }

  async createCollection(body: CreateCollectionRequestDTO) {
    try {
      if (!body.name) {
        throw new BadRequestException('Collection name is required');
      }

      await getVectorHandler().createCollection(body.name);
      return { success: true, name: body.name };
    } catch (error) {
      this.handleError(error, `Failed to create collection "${body.name}"`);
    }
  }

  async deleteCollection(collectionId: string) {
    try {
      if (!collectionId) {
        throw new BadRequestException('Collection ID is required');
      }

      await getVectorHandler().deleteCollection(collectionId);
      return { success: true, collectionId };
    } catch (error) {
      this.handleError(error, `Failed to delete collection "${collectionId}"`);
    }
  }

  async addDocToCollection(
    collectionId: string,
    data: CreateDocumentRequestDTO,
  ) {
    try {
      if (!collectionId) {
        throw new BadRequestException('Collection ID is required');
      }

      if ((!data.document && !data.url) || !data.type) {
        throw new BadRequestException(
          'Document or URL along with type is required',
        );
      }

      let parsedContent = data.document;
      if ((data.document || data.url) && data.type) {
        try {
          parsedContent = await getParserHandler().parse({
            document: data.document,
            url: data.url,
            type: data.type,
          });
        } catch (parserError) {
          throw new BadRequestException(
            `Failed to parse document: ${parserError.message}`,
          );
        }

        data.document = parsedContent;
      }

      const docId = await getVectorHandler().insertVector(collectionId, {
        id: data.id,
        document: data.document,
        url: data.url,
        type: data.type,
        metadata: data.metadata,
      });

      return {
        success: true,
        collectionId,
        documentId: docId,
        ...data,
      };
    } catch (error) {
      this.handleError(
        error,
        `Failed to add document to collection "${collectionId}"`,
      );
    }
  }

  async deleteDocsByMetadata(collectionId: string, data: DeleteDocsRequestDTO) {
    try {
      if (!collectionId) {
        throw new BadRequestException('Collection ID is required');
      }

      const count = await getVectorHandler().deleteVectorsByFilter(
        collectionId,
        data.metadataFilter || {},
      );

      return {
        success: true,
        collectionId,
        metadataFilter: data.metadataFilter,
        deletedCount: count,
      };
    } catch (error) {
      this.handleError(
        error,
        `Failed to delete documents by metadata from collection "${collectionId}"`,
      );
    }
  }

  async getDocById(collectionId: string, docId: string) {
    try {
      if (!collectionId) {
        throw new BadRequestException('Collection ID is required');
      }

      if (!docId) {
        throw new BadRequestException('Document ID is required');
      }

      const doc = await getVectorHandler().getVectorById(collectionId, docId);

      if (!doc) {
        throw new NotFoundException(
          `Document with ID "${docId}" not found in collection "${collectionId}"`,
        );
      }

      return doc;
    } catch (error) {
      this.handleError(
        error,
        `Failed to retrieve document "${docId}" from collection "${collectionId}"`,
      );
    }
  }

  async updateDoc(
    collectionId: string,
    docId: string,
    data: UpdateDocumentRequestDTO,
  ) {
    try {
      if (!collectionId) {
        throw new BadRequestException('Collection ID is required');
      }

      if (!docId) {
        throw new BadRequestException('Document ID is required');
      }

      let parsedContent = data.document;
      if ((data.document || data.url) && data.type) {
        try {
          parsedContent = await getParserHandler().parse({
            document: data.document,
            url: data.url,
            type: data.type,
          });
        } catch (parserError) {
          throw new BadRequestException(
            `Failed to parse document: ${parserError.message}`,
          );
        }

        data.document = parsedContent;
      }

      await getVectorHandler().updateVector(collectionId, docId, {
        document: data.document,
        url: data.url,
        type: data.type,
        metadata: data.metadata,
      });

      return {
        success: true,
        id: docId,
        collectionId,
        ...data,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(
        error,
        `Failed to update document "${docId}" in collection "${collectionId}"`,
      );
    }
  }

  async deleteDoc(collectionId: string, docId: string) {
    try {
      if (!collectionId) {
        throw new BadRequestException('Collection ID is required');
      }

      if (!docId) {
        throw new BadRequestException('Document ID is required');
      }

      await getVectorHandler().deleteVectorById(collectionId, docId);

      return {
        success: true,
        collectionId,
        documentId: docId,
      };
    } catch (error) {
      this.handleError(
        error,
        `Failed to delete document "${docId}" from collection "${collectionId}"`,
      );
    }
  }

  async similaritySearch(collectionId: string, data: SimilaritySearchQueryDTO) {
    try {
      if (!collectionId) {
        throw new BadRequestException('Collection ID is required');
      }

      if (!data.query) {
        throw new BadRequestException('Search query is required');
      }

      const { query, params, filter, include } = data;
      const topK = params?.topK;

      const results = await getVectorHandler().similaritySearch(
        collectionId,
        query,
        topK,
        filter,
        include,
      );

      return {
        collectionId,
        query,
        results,
        count: results.length,
        searchParams: {
          ...params,
          filter,
        },
      };
    } catch (error) {
      this.handleError(
        error,
        `Failed to perform similarity search in collection "${collectionId}"`,
      );
    }
  }

  private handleError(error: any, defaultMessage: string): never {
    // If it's already a NestJS exception, rethrow it
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    // Check for common vector database errors
    const errorMessage = error.message || defaultMessage;

    // Check for specific error patterns
    if (
      errorMessage.includes('not found') ||
      errorMessage.includes("doesn't exist")
    ) {
      throw new NotFoundException(errorMessage);
    }

    // Default to BadRequestException for client errors
    throw new BadRequestException(errorMessage);
  }
}
