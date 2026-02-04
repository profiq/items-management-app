import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { UserModule } from '@/user/user.module';
import { AuthService } from '@/auth/auth.service';
import { DecodedIdToken } from 'firebase-admin/auth';
import { getDataSourceToken, TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/user/user.entity';
import { OfficePet } from '@/office_pet/office_pet.entity';
import { DataSource } from 'typeorm';

describe('UserModule', () => {
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
        UserModule,
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          autoLoadEntities: true,
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

  it('/users (GET)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
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

  it('/users (GET) (Wrong domain)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer wrong-domain')
      .expect(403);
  });
  it('/users (GET) (Invalid token)', () => {
    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer invalid-token')
      .expect(403);
  });
  it('/users (GET) (Missing Header)', () => {
    return request(app.getHttpServer()).get('/users').expect(403);
  });
  it('/users/:id (GET)', () => {
    return request(app.getHttpServer())
      .get('/users/1')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect({
        id: 1,
        name: 'abcd abcd',
        employee_id: '1',
      });
  });

  it('/users/:id (GET) (Non-existant)', () => {
    return request(app.getHttpServer())
      .get('/users/3')
      .set('Authorization', 'Bearer valid-token')
      .expect(404);
  });

  it('/users/:id/pets (GET) (Non-existant user)', () => {
    return request(app.getHttpServer())
      .get('/users/3/pets')
      .set('Authorization', 'Bearer valid-token')
      .expect(404);
  });

  it('/users/:id/pets (GET) (No pets)', () => {
    return request(app.getHttpServer())
      .get('/users/2/pets')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
      .expect([]);
  });

  it('/users/:id/pets (GET) (Pets)', () => {
    return request(app.getHttpServer())
      .get('/users/1/pets')
      .set('Authorization', 'Bearer valid-token')
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

  it('/users/:id (DELETE)', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
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
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    return request(app.getHttpServer())
      .get('/users')
      .set('Authorization', 'Bearer valid-token')
      .expect(200)
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
