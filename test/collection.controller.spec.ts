import { Test, TestingModule } from '@nestjs/testing';
import CollectionController from 'src/modules/collection/collection.controller';
import CollectionService from 'src/modules/collection/collection.service';
import { ChunkFileRequestDTO } from 'src/modules/collection/dto/request/chunkFile.request';
import { CreateCollectionRequestDTO } from 'src/modules/collection/dto/request/createCollection.request';
import { CreateDocumentRequestDTO } from 'src/modules/collection/dto/request/createDoc.request';
import { SimilaritySearchQueryDTO } from 'src/modules/collection/dto/request/similaritySearchQuery.request';

// Create mock for CollectionService
const mockCollectionService = {
  getCollections: jest.fn(),
  chunkFileToCollection: jest.fn(),
  createCollection: jest.fn(),
  deleteCollection: jest.fn(),
  addDocToCollection: jest.fn(),
  deleteDocsByMetadata: jest.fn(),
  getDocById: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  similaritySearch: jest.fn(),
};

describe('CollectionController', () => {
  let controller: CollectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        {
          provide: CollectionService,
          useValue: mockCollectionService,
        },
      ],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);

    // Reset all mock implementations before each test
    jest.clearAllMocks();
  });

  describe('getCollections', () => {
    it('should return an array of collections', async () => {
      // Arrange
      const expectedCollections = {
        collections: ['collection1', 'collection2'],
      };
      mockCollectionService.getCollections.mockResolvedValue(
        expectedCollections,
      );

      // Act
      const result = await controller.getCollections();

      // Assert
      expect(mockCollectionService.getCollections).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedCollections);
    });
  });

  describe('createCollection', () => {
    it('should create a collection and return success response', async () => {
      // Arrange
      const createDto: CreateCollectionRequestDTO = { name: 'testCollection' };
      const expectedResponse = { success: true, name: 'testCollection' };

      mockCollectionService.createCollection.mockResolvedValue(
        expectedResponse,
      );

      // Act
      const result = await controller.createCollection(createDto);

      // Assert
      expect(mockCollectionService.createCollection).toHaveBeenCalledWith(
        createDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('addDocToCollection', () => {
    it('should add document to collection and return success response', async () => {
      // Arrange
      const collectionId = 'col1';
      // Include all properties explicitly
      const docDto = {
        id: 'test-doc-id',
        document: 'test content',
        metadata: { source: 'test' },
      } as CreateDocumentRequestDTO;

      const expectedResponse = {
        success: true,
        collectionId,
        documentId: 'doc123',
        document: 'parsed test content',
        metadata: { source: 'test' },
      };

      mockCollectionService.addDocToCollection.mockResolvedValue(
        expectedResponse,
      );

      // Act
      const result = await controller.addDocToCollection(collectionId, docDto);

      // Assert
      expect(mockCollectionService.addDocToCollection).toHaveBeenCalledWith(
        collectionId,
        docDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('chunkFileToCollection', () => {
    it('should add documents from file to collection and return success response', async () => {
      // Arrange
      const collectionId = 'col1';
      // Include all properties explicitly
      const chunkFileDto = {
        url: 'https://example.com/file.txt',
        type: 'text',
        options: { chunkSize: 1000 },
      } as ChunkFileRequestDTO;

      const expectedResponse = {
        success: true,
        collectionId,
        ids: ['doc1', 'doc2'],
      };

      mockCollectionService.chunkFileToCollection.mockResolvedValue(
        expectedResponse,
      );

      // Act
      const result = await controller.chunkFileToCollection(
        collectionId,
        chunkFileDto,
      );

      // Assert
      expect(mockCollectionService.chunkFileToCollection).toHaveBeenCalledWith(
        collectionId,
        chunkFileDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteCollection', () => {
    it('should delete collection and return success response', async () => {
      // Arrange
      const collectionId = 'col1';
      const expectedResponse = { success: true, collectionId };

      mockCollectionService.deleteCollection.mockResolvedValue(
        expectedResponse,
      );

      // Act
      const result = await controller.deleteCollection(collectionId);

      // Assert
      expect(mockCollectionService.deleteCollection).toHaveBeenCalledWith(
        collectionId,
      );
      expect(result).toEqual(expectedResponse);
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
      };

      const expectedResponse = {
        collectionId,
        query: 'search query',
        results: [
          { id: 'doc1', score: 0.9 },
          { id: 'doc2', score: 0.8 },
        ],
        count: 2,
        searchParams: {
          topK: 5,
          filter: { source: 'web' },
        },
      };

      mockCollectionService.similaritySearch.mockResolvedValue(
        expectedResponse,
      );

      // Act
      const result = await controller.similaritySearch(collectionId, searchDto);

      // Assert
      expect(mockCollectionService.similaritySearch).toHaveBeenCalledWith(
        collectionId,
        searchDto,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
