import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setVectorHandler } from '../src/core/managers/vectorManager';
import { setParserHandler } from '../src/core/managers/parserManager';
import { MockVectorHandler } from './mock-vector-handler';
import { MockParserHandler } from './mock-parser-handler';

describe('App (e2e)', () => {
  let app: INestApplication;
  let mockVectorHandler: MockVectorHandler;
  let mockParserHandler: MockParserHandler;
  // Add auth token variable - replace with your actual token value
  const authToken = 'your-test-auth-token';

  beforeAll(async () => {
    // Create and set mock handlers
    mockVectorHandler = new MockVectorHandler();
    mockParserHandler = new MockParserHandler();
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

  // Basic health check test
  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health') // Or any basic endpoint your app has
      .set('Authorization', `Bearer ${authToken}`) // Add auth header
      .expect(200);
  });

  // Basic collections test to verify the API is working
  it('/collections (GET)', () => {
    return request(app.getHttpServer())
      .get('/collections')
      .set('Authorization', `Bearer ${authToken}`) // Add auth header
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });
});