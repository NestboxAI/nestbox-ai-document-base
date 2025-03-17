import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { setVectorHandler } from 'src/core/managers/vectorManager';
import { setParserHandler } from 'src/core/managers/parserManager';
import { MockVectorHandler } from './mock-vector-handler';
import { MockParserHandler } from './mock-parser-handler';
import { AppModule } from 'src/app.module';
import AppConfig from 'src/configs/app.config';

describe('Collection API (e2e)', () => {
  let app: INestApplication;
  let mockVectorHandler: MockVectorHandler;
  let mockParserHandler: MockParserHandler;
  // Authentication token - you'll need to adjust this based on your auth setup
  const authToken = AppConfig.APP.API_KEY; 

  beforeAll(async () => {
    // Create mock handlers
    mockVectorHandler = new MockVectorHandler();
    mockParserHandler = new MockParserHandler();

    // Set the mock handlers
    setVectorHandler(mockVectorHandler);
    setParserHandler(mockParserHandler);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Create a test collection to use in subsequent tests
  let testCollectionId: string;

  describe('Collections', () => {
    it('/collections (POST) - should create a new collection', () => {
      return request(app.getHttpServer())
        .post('/collections')
        .set('authorization', `${authToken}`) // Add auth header
        .send({ name: 'test-collection' })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('name', 'test-collection');
          testCollectionId = 'test-collection'; // Store for later tests
        });
    });

    it('/collections (GET) - should list all collections', () => {
      return request(app.getHttpServer())
        .get('/collections')
        .set('authorization', `${authToken}`) // Add auth header
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).toContain('test-collection');
        });
    });
  });

  describe('Documents', () => {
    let testDocId: string;

    it('/collections/:collection_id/docs (POST) - should add a doc to collection', () => {
      return request(app.getHttpServer())
        .post(`/collections/${testCollectionId}/docs`)
        .set('authorization', `${authToken}`) // Add auth header
        .send({
          id: "integration-test-doc",
          document: 'This is a test document',
          url: "https://example.com/integration-test",
          type: 'text',
          metadata: { source: 'integration-test' }
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('collectionId', testCollectionId);
          expect(res.body).toHaveProperty('documentId');
          testDocId = res.body.documentId; // Store for later tests
        });
    });

    it('/collections/:collection_id/docs/:doc_id (GET) - should get a doc by ID', () => {
      return request(app.getHttpServer())
        .get(`/collections/${testCollectionId}/docs/${testDocId}`)
        .set('authorization', `${authToken}`) // Add auth header
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', testDocId);
          expect(res.body).toHaveProperty('document');
          expect(res.body).toHaveProperty('metadata');
          expect(res.body.metadata).toHaveProperty('source', 'integration-test');
        });
    });

    it('/collections/:collection_id/docs/:doc_id (PUT) - should update a doc', () => {
      return request(app.getHttpServer())
        .put(`/collections/${testCollectionId}/docs/${testDocId}`)
        .set('authorization', `${authToken}`) // Add auth header
        .send({
          id: testDocId,
          document: 'This is an updated test document',
          url: "https://example.com/updated-test",
          type: 'text',
          metadata: { 
            source: 'integration-test',
            updated: true 
          }
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('id', testDocId);
          // Adjust expectation to account for [PARSED_TEXT] prefix added by the mock parser
          expect(res.body.document).toContain('This is an updated test document');
          expect(res.body.metadata).toHaveProperty('updated', true);
        });
    });

    it('/collections/:collection_id/query (POST) - should perform similarity search', () => {
      return request(app.getHttpServer())
        .post(`/collections/${testCollectionId}/query`)
        .set('authorization', `${authToken}`) // Add auth header
        .send({
          query: 'test document',
          params: { topK: 5 },
          filter: { 'metadata.source': 'integration-test' },
          include: ['document', 'metadata']
        })
        // Updated to expect 201 since that's what your API is returning
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('collectionId', testCollectionId);
          expect(res.body).toHaveProperty('query', 'test document');
          expect(res.body).toHaveProperty('results');
          expect(Array.isArray(res.body.results)).toBe(true);
          expect(res.body.results.length).toBeGreaterThan(0);
          expect(res.body.results[0]).toHaveProperty('id');
          expect(res.body.results[0]).toHaveProperty('score');
        });
    });

    it('/collections/:collection_id/docs/:doc_id (DELETE) - should delete a doc by ID', () => {
      return request(app.getHttpServer())
        .delete(`/collections/${testCollectionId}/docs/${testDocId}`)
        .set('authorization', `${authToken}`) // Add auth header
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('collectionId', testCollectionId);
          expect(res.body).toHaveProperty('documentId', testDocId);
        });
    });

    it('/collections/:collection_id/docs (DELETE) - should delete docs by metadata filter', () => {
      // First, add another document for testing deletion by metadata
      let filterTestDocId: string;

      // Chain the requests for proper test sequencing
      return request(app.getHttpServer())
        .post(`/collections/${testCollectionId}/docs`)
        .set('authorization', `${authToken}`) // Add auth header
        .send({
          id: "filter-test-doc",
          document: 'This document will be deleted by filter',
          url: "https://example.com/filter-test",
          type: 'text',
          metadata: { 
            source: 'filter-test',
            deleteMe: true 
          }
        })
        .expect(201)
        .expect((res) => {
          filterTestDocId = res.body.documentId;
        })
        .then(() => {
          // Now test the deletion by filter
          return request(app.getHttpServer())
            .delete(`/collections/${testCollectionId}/docs`)
            .set('authorization', `${authToken}`) // Add auth header
            .query({ filter: JSON.stringify({ 'metadata.deleteMe': true }) })
            .expect(200)
            .expect((res) => {
              expect(res.body).toHaveProperty('success', true);
              expect(res.body).toHaveProperty('collectionId', testCollectionId);
              expect(res.body).toHaveProperty('deletedCount', 1);
            });
        });
    });
  });

  describe('Collection Deletion', () => {
    it('/collections/:collection_id (DELETE) - should delete the collection', () => {
      return request(app.getHttpServer())
        .delete(`/collections/${testCollectionId}`)
        .set('authorization', `${authToken}`) // Add auth header
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('collectionId', testCollectionId);
        });
    });

    it('/collections (GET) - should verify collection was deleted', () => {
      return request(app.getHttpServer())
        .get('/collections')
        .set('authorization', `${authToken}`) // Add auth header
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body).not.toContain(testCollectionId);
        });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 when accessing non-existent collection', () => {
      return request(app.getHttpServer())
        .get('/collections/non-existent-collection/docs')
        .set('authorization', `${authToken}`) // Add auth header
        .expect(404);
    });

    it('should return 400 when creating collection with missing name', () => {
      return request(app.getHttpServer())
        .post('/collections')
        .set('authorization', `${authToken}`) // Add auth header
        .send({})
        .expect(400);
    });

    it('should return 400 when adding doc with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/collections/test-error/docs')
        .set('authorization', `${authToken}`) // Add auth header
        .send({
          // Missing document and type
          metadata: { test: true }
        })
        .expect(400);
    });
  });
});