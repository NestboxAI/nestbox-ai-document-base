import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setVectorHandler } from '../src/core/managers/vectorManager';
import { setParserHandler } from '../src/core/managers/parserManager';
import { MockVectorHandler } from './mock-vector-handler';
import { MockParserHandler } from './mock-parser-handler';
import AppConfig from 'src/configs/app.config';

describe('App (e2e)', () => {
  let app: INestApplication;
  let mockVectorHandler: MockVectorHandler;
  let mockParserHandler: MockParserHandler;
  const authToken = AppConfig.APP.API_KEY;

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

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  // Basic collections test to verify the API is working
  it('/collections (GET)', () => {
    return request(app.getHttpServer())
      .get('/collections')
      .set('authorization', `${authToken}`) // Add auth header
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('collections');
      });
  });
});
