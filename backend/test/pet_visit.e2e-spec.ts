import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AuthService } from '@/auth/auth.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { OfficePet } from '@/office_pet/office_pet.entity';
import { DataSource } from 'typeorm';
import { PetVisit } from '@/pet_visit/pet_visit.entity';
import { PetVisitModule } from '@/pet_visit/pet_visit.module';

describe('PetVisitModule', () => {
  let app: INestApplication<App>;

  const authService = {
    verifyToken: async (token: string): Promise<DecodedIdToken> => {
      if (token == 'valid-token') {
        return { email: 'valid@profiq.com' } as DecodedIdToken;
      }
      if (token == 'wrong-domain') {
        return { email: 'invalid@example.com' } as DecodedIdToken;
      }
      return { email: undefined } as DecodedIdToken;
    },
  };

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

  it('/visits (GET)', () => {
    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
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

  it('/visits (GET) (Wrong domain)', () => {
    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', 'Bearer wrong-domain')
      .expect(403);
  });

  it('/visits (GET) (Invalid token)', () => {
    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);
  });

  it('/visits (GET) (Missing Header)', () => {
    return request(app.getHttpServer()).get('/visits').expect(403);
  });

  it('/visits (POST)', async () => {
    const date = new Date();
    await request(app.getHttpServer())
      .post('/visits')
      .send({
        pet_id: 1,
        date: date,
      })
      .set('Authorization', 'Bearer valid-token')
      .set('Content-Type', 'application/json')
      .expect(201);

    return request(app.getHttpServer())
      .get('/visits')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
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
