import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { EmployeeModule } from './employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PetVisitModule } from './pet_visit/pet_visit.module';
import { OfficePetModule } from './office_pet/office_pet.module';
import { UserModule } from './user/user.module';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './datasource';

@Module({
  imports: [
    HelloModule,
    EmployeeModule,
    UserModule,
    PetVisitModule,
    OfficePetModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: '../.env',
      cache: true,
    }),
  ],
})
export class AppModule {}
