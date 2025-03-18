import { Test, TestingModule } from '@nestjs/testing';
import { getVectorHandler } from 'src/core/managers/vectorManager';
import { getParserHandler } from 'src/core/managers/parserManager';
import {
  BadRequestException,
  NotFoundException,
} from 'src/core/exceptions/response.exception';
import CollectionService from 'src/modules/collection/collection.service';
import { CreateCollectionRequestDTO } from 'src/modules/collection/dto/request/createCollection.request';
import { CreateDocumentRequestDTO } from 'src/modules/collection/dto/request/createDoc.request';
import { SimilaritySearchQueryDTO } from 'src/modules/collection/dto/request/similaritySearchQuery.request';
import { ChunkFileRequestDTO } from 'src/modules/collection/dto/request/chunkFile.request';

// Mock implementations
const mockVectorHandler = {
  createCollection: jest.fn(),
  batchInsertVectors: jest.fn(),
  listCollections: jest.fn(),
  insertVector: jest.fn(),
  similaritySearch: jest.fn(),
  deleteCollection: jest.fn(),
  updateVector: jest.fn(),
  deleteVectorById: jest.fn(),
  deleteVectorsByFilter: jest.fn(),
  getVectorById: jest.fn(),
};

const mockParserHandler = {
  parse: jest.fn(),
};

jest.mock('src/core/managers/vectorManager', () => ({
  getVectorHandler: jest.fn(),
  setVectorHandler: jest.fn(),
}));

jest.mock('src/core/managers/parserManager', () => ({
  getParserHandler: jest.fn(),
  setParserHandler: jest.fn(),
}));

describe('CollectionService', () => {
  let service: CollectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionService],
    }).compile();

    service = module.get<CollectionService>(CollectionService);

    // Setup mocks
    (getVectorHandler as jest.Mock).mockReturnValue(mockVectorHandler);
    (getParserHandler as jest.Mock).mockReturnValue(mockParserHandler);

    // Reset mock calls before each test
    jest.clearAllMocks();
  });

  describe('getCollections', () => {
    it('should return an array of collections', async () => {
      // Arrange
      const collections = ['collection1', 'collection2'];
      const expectedCollections = {
        collections,
      };
      mockVectorHandler.listCollections.mockResolvedValue(collections);

      // Act
      const result = await service.getCollections();

      // Assert
      expect(mockVectorHandler.listCollections).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCollections);
    });

    it('should handle error and rethrow', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      mockVectorHandler.listCollections.mockRejectedValue(
        new Error(errorMessage),
      );

      // Act & Assert
      await expect(service.getCollections()).rejects.toThrow(
        BadRequestException,
      );
      expect(mockVectorHandler.listCollections).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCollection', () => {
    it('should create a collection and return success', async () => {
      // Arrange
      const createDto: CreateCollectionRequestDTO = { name: 'testCollection' };
      mockVectorHandler.createCollection.mockResolvedValue(undefined);

      // Act
      const result = await service.createCollection(createDto);

      // Assert
      expect(mockVectorHandler.createCollection).toHaveBeenCalledWith(
        'testCollection',
        undefined,
      );
      expect(result).toEqual({ success: true, name: 'testCollection' });
    });

    it('should throw BadRequestException when name is not provided', async () => {
      // Arrange
      const createDto = { name: '' } as CreateCollectionRequestDTO;

      // Act & Assert
      await expect(service.createCollection(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockVectorHandler.createCollection).not.toHaveBeenCalled();
    });

    it('should handle vector database errors', async () => {
      // Arrange
      const createDto = {
        name: 'testCollection',
      } as CreateCollectionRequestDTO;
      mockVectorHandler.createCollection.mockRejectedValue(
        new Error('Collection already exists'),
      );

      // Act & Assert
      await expect(service.createCollection(createDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockVectorHandler.createCollection).toHaveBeenCalledWith(
        'testCollection',
        undefined,
      );
    });
  });

  describe('addDocToCollection', () => {
    it('should add document to collection and return success', async () => {
      // Arrange
      const collectionId = 'col1';
      // Explicitly include all properties
      const docDto = {
        id: undefined,
        document: 'test content',
        metadata: { source: 'test' },
      } as CreateDocumentRequestDTO;
      const newDocId = 'doc123';

      mockVectorHandler.insertVector.mockResolvedValue(newDocId);

      // Act
      const result = await service.addDocToCollection(collectionId, docDto);

      // Assert
      expect(mockVectorHandler.insertVector).toHaveBeenCalledWith(
        collectionId,
        {
          id: undefined,
          document: 'test content',
          metadata: { source: 'test' },
        },
      );

      expect(result).toEqual({
        success: true,
        collectionId,
        documentId: newDocId,
        document: 'test content',
        metadata: { source: 'test' },
      });
    });

    it('should chunk file to collection and return success', async () => {
      // Arrange
      const collectionId = 'col1';
      // Explicitly include all properties
      const chunkFileDto = {
        url: 'https://example.com/file.txt',
        type: 'text',
        options: { source: 'web' },
      } as ChunkFileRequestDTO;

      const newDocIds = ['doc1', 'doc2'];

      mockVectorHandler.batchInsertVectors.mockResolvedValue(newDocIds);
      mockParserHandler.parse.mockResolvedValue({
        ids: newDocIds,
        documents: ['doc1 content', 'doc2 content'],
        metadatas: [{}, {}],
      });

      // Act
      const result = await service.chunkFileToCollection(
        collectionId,
        chunkFileDto,
      );

      // Assert
      expect(mockVectorHandler.batchInsertVectors).toHaveBeenCalledWith(
        collectionId,
        {
          ids: newDocIds,
          documents: ['doc1 content', 'doc2 content'],
          metadatas: [{}, {}],
        },
      );

      expect(result).toEqual({
        success: true,
        collectionId,
        ids: newDocIds,
      });
    });

    it('should throw BadRequestException when collection ID is not provided', async () => {
      // Arrange
      const collectionId = '';
      const docDto: CreateDocumentRequestDTO = {
        id: undefined,
        document: 'test content',
        metadata: { source: 'test' },
      };

      // Act & Assert
      await expect(
        service.addDocToCollection(collectionId, docDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockParserHandler.parse).not.toHaveBeenCalled();
      expect(mockVectorHandler.insertVector).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when document and type are not provided', async () => {
      // Arrange
      const collectionId = 'col1';
      const docDto = {} as CreateDocumentRequestDTO;

      // Act & Assert
      await expect(
        service.addDocToCollection(collectionId, docDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockParserHandler.parse).not.toHaveBeenCalled();
      expect(mockVectorHandler.insertVector).not.toHaveBeenCalled();
    });

    it('should handle parser errors', async () => {
      // Arrange
      const collectionId = 'col1';
      const docDto: CreateDocumentRequestDTO = {
        id: undefined,
        document: undefined,
        metadata: { source: 'test' },
      };

      // Act & Assert
      await expect(
        service.addDocToCollection(collectionId, docDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockVectorHandler.insertVector).not.toHaveBeenCalled();
    });
  });

  describe('similaritySearch', () => {
    it('should perform similarity search and return results', async () => {
      // Arrange
      const collectionId = 'col1';
      const searchDto: SimilaritySearchQueryDTO = {
        query: 'search query',
        params: { topK: 5 },
        filter: { source: 'web' },
        include: ['document', 'metadata'],
      };

      const mockResults = [
        { id: 'doc1', score: 0.9, document: 'relevant content 1' },
        { id: 'doc2', score: 0.8, document: 'relevant content 2' },
      ];

      mockVectorHandler.similaritySearch.mockResolvedValue(mockResults);

      // Act
      const result = await service.similaritySearch(collectionId, searchDto);

      // Assert
      expect(mockVectorHandler.similaritySearch).toHaveBeenCalledWith(
        collectionId,
        'search query',
        5,
        { source: 'web' },
        ['document', 'metadata'],
      );

      expect(result).toEqual({
        collectionId,
        query: 'search query',
        results: mockResults,
        count: 2,
        searchParams: {
          topK: 5,
          filter: { source: 'web' },
        },
      });
    });

    it('should throw BadRequestException when collection ID is not provided', async () => {
      // Arrange
      const collectionId = '';
      const searchDto: SimilaritySearchQueryDTO = {
        query: 'search query',
      };

      // Act & Assert
      await expect(
        service.similaritySearch(collectionId, searchDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockVectorHandler.similaritySearch).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when query is not provided', async () => {
      // Arrange
      const collectionId = 'col1';
      const searchDto = { query: '' } as SimilaritySearchQueryDTO;

      // Act & Assert
      await expect(
        service.similaritySearch(collectionId, searchDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockVectorHandler.similaritySearch).not.toHaveBeenCalled();
    });

    it('should handle vector database errors', async () => {
      // Arrange
      const collectionId = 'col1';
      const searchDto: SimilaritySearchQueryDTO = {
        query: 'search query',
      };

      mockVectorHandler.similaritySearch.mockRejectedValue(
        new Error('Collection not found'),
      );

      // Act & Assert
      await expect(
        service.similaritySearch(collectionId, searchDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockVectorHandler.similaritySearch).toHaveBeenCalled();
    });
  });
});
