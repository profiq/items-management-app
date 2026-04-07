import { Module } from '@nestjs/common';
import { EmployeeModule } from './employee/employee.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ItemsModule } from './items/items.module';
import configuration from './config/configuration';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './datasource';
import { CategoriesModule } from './categories/categories.module';
import { CitiesModule } from './cities/cities.module';
import { TagsModule } from './tags/tags.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [
    EmployeeModule,
    UserModule,
    ItemsModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: '../.env',
      cache: true,
    }),
    CategoriesModule,
    CitiesModule,
    TagsModule,
    LocationsModule,
  ],
})
export class AppModule {}
