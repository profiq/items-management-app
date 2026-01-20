import { Module } from '@nestjs/common';
import { HelloModule } from './hello/hello.module';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [HelloModule, EmployeeModule],
})
export class AppModule {}
