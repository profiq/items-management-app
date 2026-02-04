import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { HelloModule } from '@/hello/hello.module';
import { StatusCodes } from 'http-status-codes';

describe('HelloModule', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HelloModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/hello (GET)', () => {
    return request(app.getHttpServer())
      .get('/hello')
      .expect(StatusCodes.OK)
      .expect({ hello: 'world' });
  });

  it('/hello/1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/hello/1')
      .expect(StatusCodes.OK)
      .expect({ hello_id: 1 });
  });

  it('/hello/-1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/hello/-1')
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('/hello/abcd (GET)', () => {
    return request(app.getHttpServer())
      .get('/hello/abcd')
      .expect(StatusCodes.BAD_REQUEST);
  });

  it('/hello/10 (GET)', () => {
    return request(app.getHttpServer())
      .get('/hello/10')
      .expect(StatusCodes.NOT_FOUND);
  });

  afterAll(async () => {
    await app.close();
  });
});
