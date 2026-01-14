import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { HelloModule } from '../src/hello/hello.module';

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
      .expect(200)
      .expect({ hello: 'world' });
  });

  it('/hello/1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/hello/1')
      .expect(200)
      .expect({ hello_id: 1 });
  });

  it('/hello/-1 (GET)', () => {
    return request(app.getHttpServer()).get('/hello/-1').expect(400);
  });

  it('/hello/abcd (GET)', () => {
    return request(app.getHttpServer()).get('/hello/abcd').expect(400);
  });

  it('/hello/10 (GET)', () => {
    return request(app.getHttpServer()).get('/hello/10').expect(404);
  });

  afterAll(async () => {
    await app.close();
  });
});
