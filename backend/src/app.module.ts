import { Module } from '@nestjs/common';
import { EmployeeModule } from './employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './datasource';

@Module({
  imports: [
    EmployeeModule,
    UserModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: '../.env',
      cache: true,
    }),
  ],
})
export class AppModule {}
