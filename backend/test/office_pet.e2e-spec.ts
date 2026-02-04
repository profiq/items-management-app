import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AuthService } from '@/auth/auth.service';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { OfficePet } from '@/office_pet/office_pet.entity';
import { DataSource } from 'typeorm';
import { OfficePetModule } from '@/office_pet/office_pet.module';
import { PetVisit } from '@/pet_visit/pet_visit.entity';
import { setupAuth } from './auth';
import { TimeDuration } from '@/lib/time';

describe('OfficePetModule', () => {
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
        OfficePetModule,
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
    const users = (
      await userRepository.insert([
        { id: 1, name: 'abcd abcd', employee_id: '1' },
        { id: 2, name: 'BBBBB', employee_id: '2' },
      ])
    ).identifiers;
    const petRepository = dataSource.getRepository(OfficePet);
    const pets = await petRepository.insert([
      { name: 'Alex', race: 'big', species: 'dog', owner: users[0] },
      { name: 'Bruno', race: 'some', species: 'cat', owner: users[0] },
    ]);
    const visitRepository = dataSource.getRepository(PetVisit);
    await visitRepository.insert([
      { date: new Date(0), pet: pets.identifiers[0] },
    ]);
  });

  it('/pets (GET)', async () => {
    return request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect([
        {
          id: 1,
          name: 'Alex',
          race: 'big',
          species: 'dog',
        },
        {
          id: 2,
          name: 'Bruno',
          race: 'some',
          species: 'cat',
        },
      ]);
  });

  it('/pets (GET) (Wrong domain)', async () => {
    return request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(403);
  });
  it('/pets (GET) (Invalid token)', () => {
    return request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);
  });
  it('/pets (GET) (Missing Header)', () => {
    return request(app.getHttpServer()).get('/pets').expect(403);
  });
  it('/pets/:id (GET)', async () => {
    return request(app.getHttpServer())
      .get('/pets/1')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect({
        id: 1,
        name: 'Alex',
        race: 'big',
        species: 'dog',
      });
  });
  it('/pets/:id (GET) (Non-existant)', async () => {
    return request(app.getHttpServer())
      .get('/pets/3')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
  });

  it('/pets/:id/visits (GET) (Non-existant pet)', async () => {
    return request(app.getHttpServer())
      .get('/pets/3/visits')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(404);
  });

  it('/pets/:id/visits (GET) (No visits)', async () => {
    return request(app.getHttpServer())
      .get('/pets/2/visits')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect([]);
  });

  it('/pets/:id/visits (GET) (Visits)', async () => {
    return request(app.getHttpServer())
      .get('/pets/1/visits')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect([
        {
          id: 1,
          date: new Date(0).toISOString(),
        },
      ]);
  });

  it('/pets (POST)', async () => {
    await request(app.getHttpServer())
      .post('/pets')
      .send({
        owner_id: '1',
        race: 'uslu',
        name: 'rem',
        species: 'pin',
      })
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'application/json')
      .expect(201);
    return request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect([
        {
          id: 1,
          name: 'Alex',
          race: 'big',
          species: 'dog',
        },
        {
          id: 2,
          name: 'Bruno',
          race: 'some',
          species: 'cat',
        },
        {
          id: 3,
          race: 'uslu',
          name: 'rem',
          species: 'pin',
        },
      ]);
  });

  it('/pets/:id (PUT)', async () => {
    await request(app.getHttpServer())
      .put('/pets/1')
      .send({
        owner_id: '2',
        name: 'harhar',
      })
      .set('Authorization', `Bearer ${validToken}`)
      .set('Content-Type', 'application/json')
      .expect(200);

    return request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect([
        {
          id: 1,
          name: 'harhar',
          race: 'big',
          species: 'dog',
        },
        {
          id: 2,
          name: 'Bruno',
          race: 'some',
          species: 'cat',
        },
      ]);
  });

  it('/pets/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .delete('/pets/1')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    return request(app.getHttpServer())
      .get('/pets')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect([
        {
          id: 2,
          name: 'Bruno',
          race: 'some',
          species: 'cat',
        },
      ]);
  });

  afterAll(async () => {
    await app.close();
  });
});
