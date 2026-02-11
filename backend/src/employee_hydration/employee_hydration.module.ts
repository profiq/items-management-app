import { EmployeeModule } from '@/employee/employee.module';
import { UserModule } from '@/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { EmployeeHydrationInterceptor } from './employee_hydration.interceptor';

@Module({
  imports: [forwardRef(() => UserModule), forwardRef(() => EmployeeModule)],
  providers: [EmployeeHydrationInterceptor],
  exports: [
    EmployeeHydrationInterceptor,
    forwardRef(() => UserModule),
    forwardRef(() => EmployeeModule),
  ],
})
export class EmployeeHydrationModule {}
