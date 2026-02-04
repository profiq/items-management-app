import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AuthService } from '@/auth/auth.service';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { OfficePet } from '@/office_pet/office_pet.entity';
import { DataSource } from 'typeorm';
import { PetVisit } from '@/pet_visit/pet_visit.entity';
import { PetVisitModule } from '@/pet_visit/pet_visit.module';
import { setupAuth } from './auth';
import { TimeDuration } from '@/lib/time';
import { StatusCodes } from 'http-status-codes';

describe('PetVisitModule', () => {
  let app: INestApplication<App>;
  let authService: AuthService;
  let validToken: string;
  let invalidToken: string;

  beforeAll(async () => {
    const authSetup = await setupAuth();
    authService = authSetup.authService;
    validToken = authSetup.validToken;
    invalidToken = authSetup.invalidToken;
  }, 30 * TimeDuration.Second);

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        PetVisitModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [OfficePet, User, PetVisit],
          synchronize: true,
          dropSchema: true,
        }),
      ],
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
    await userRepository.save(user);
    const petRepository = dataSource.getRepository(OfficePet);
    const pets = await petRepository.insert([
      { name: 'Alex', race: 'big', species: 'dog', owner: user },
      { name: 'Bruno', race: 'some', species: 'cat', owner: user },
    ]);
    const visitRepository = dataSource.getRepository(PetVisit);
    await visitRepository.insert([
      { date: new Date(0), pet: pets.identifiers[0] },
      { date: new Date(100), pet: pets.identifiers[1] },
      { date: new Date(1000), pet: pets.identifiers[0] },
    ]);
  });

  it('/visits (GET)', async () => {
    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([
        {
          id: 1,
          date: new Date(0).toISOString(),
        },
        {
          id: 2,
          date: new Date(100).toISOString(),
        },
        {
          id: 3,
          date: new Date(1000).toISOString(),
        },
      ]);
  });

  it('/visits (GET) (Wrong domain)', async () => {
    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(StatusCodes.FORBIDDEN);
  });

  it('/visits (GET) (Invalid token)', () => {
    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', 'Bearer invalid-token')
      .expect(StatusCodes.FORBIDDEN);
  });

  it('/visits (GET) (Missing Header)', () => {
    return request(app.getHttpServer())
      .get('/visits')
      .expect(StatusCodes.FORBIDDEN);
  });

  it('/visits (POST)', async () => {
    const date = new Date();
    await request(app.getHttpServer())
      .post('/visits')
      .send({
        pet_id: 1,
        date: date,
      })
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'application/json')
      .expect(StatusCodes.CREATED);

    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(StatusCodes.OK)
      .expect([
        {
          id: 1,
          date: new Date(0).toISOString(),
        },
        {
          id: 2,
          date: new Date(100).toISOString(),
        },
        {
          id: 3,
          date: new Date(1000).toISOString(),
        },
        {
          id: 4,
          date: date.toISOString(),
        },
      ]);
  });

  afterAll(async () => {
    await app.close();
  });
});
