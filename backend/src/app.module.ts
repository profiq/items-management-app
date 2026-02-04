import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { EmployeeModule } from './employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetVisitModule } from './pet_visit/pet_visit.module';
import { OfficePetModule } from './office_pet/office_pet.module';
import { UserModule } from './user/user.module';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HelloModule,
    EmployeeModule,
    UserModule,
    PetVisitModule,
    OfficePetModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: '../.env',
      cache: true,
    }),
  ],
})
export class AppModule {}
