import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UserModule } from '@/user/user.module';
import { AuthService } from '@/auth/auth.service';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { OfficePet } from '@/office_pet/office_pet.entity';
import { DataSource } from 'typeorm';
import { TimeDuration } from '@/lib/time';
import { setupAuth } from './auth';
import { StatusCodes } from 'http-status-codes';
import { dbConfig } from './database';

describe('UserModule', () => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let validToken: string;
  let invalidToken: string;

  // Auth emulator is lazy loaded and not particularly fast at that,
  // so load AuthModule only once per test suite
  beforeAll(async () => {
    const authSetup = await setupAuth();
    authService = authSetup.authService;
    validToken = authSetup.validToken;
    invalidToken = authSetup.invalidToken;
  }, 30 * TimeDuration.Second);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UserModule, TypeOrmModule.forRoot(dbConfig)],
    })
      .overrideProvider(AuthService)
      .useValue(authService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    const dataSource = moduleFixture.get<DataSource>(getDataSourceToken());
    const userRepository = dataSource.getRepository(User);
    const user = new User();
    user.id = 1;
    user.name = 'abcd abcd';
    user.employee_id = '1';
    //await userRepository.save(user);
    await dataSource.manager.save(user);
    userRepository.insert([{ id: 2, name: 'Eve', employee_id: '2' }]);
    const petRepository = dataSource.getRepository(OfficePet);
    const pet = new OfficePet();
    pet.name = 'Alex';
    pet.race = 'big';
    pet.species = 'dog';
    pet.owner = user;
    await petRepository.save(pet);
    const pet2 = new OfficePet();
    pet2.name = 'Bruno';
    pet2.race = 'some';
    pet2.species = 'cat';
    pet2.owner = user;
    await petRepository.save(pet2);
  });

  it('/users (GET)', async () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([
        {
          id: 1,
          name: 'abcd abcd',
          employee_id: '1',
        },
        {
          id: 2,
          name: 'Eve',
          employee_id: '2',
        },
      ]);
  });

  it('/users (GET) (Wrong domain)', async () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(StatusCodes.FORBIDDEN);
  });
  it('/users (GET) (Invalid token)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer invalid-token')
      .expect(StatusCodes.FORBIDDEN);
  });
  it('/users (GET) (Missing Header)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(StatusCodes.FORBIDDEN);
  });
  it('/users/:id (GET)', async () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect({
        id: 1,
        name: 'abcd abcd',
        employee_id: '1',
      });
  });

  it('/users/:id (GET) (Non-existant)', async () => {
    return request(app.getHttpServer())
      .get('/users/3')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.NOT_FOUND);
  });

  it('/users/:id/pets (GET) (Non-existant user)', async () => {
    return request(app.getHttpServer())
      .get('/users/3/pets')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.NOT_FOUND);
  });

  it('/users/:id/pets (GET) (No pets)', async () => {
    return request(app.getHttpServer())
      .get('/users/2/pets')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([]);
  });

  it('/users/:id/pets (GET) (Pets)', async () => {
    return request(app.getHttpServer())
      .get('/users/1/pets')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([
        {
          id: 1,
          name: 'Alex',
          race: 'big',
          species: 'dog',
          image_url: null,
        },
        {
          id: 2,
          name: 'Bruno',
          race: 'some',
          species: 'cat',
          image_url: null,
        },
      ]);
  });

  it('/users/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([
        {
          id: 1,
          name: 'abcd abcd',
          employee_id: '1',
        },
        {
          id: 2,
          name: 'Eve',
          employee_id: '2',
        },
      ]);

    await request(app.getHttpServer())
      .delete('/users/2')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK);

    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([
        {
          id: 1,
          name: 'abcd abcd',
          employee_id: '1',
        },
      ]);
  });

  afterAll(async () => {
    await app.close();
  });
});
