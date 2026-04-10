import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AuthGuard } from '@/auth/auth.guard';
import { RolesGuard } from '@/auth/roles.guard';
import { Roles } from '@/auth/roles.decorator';
import { UserRole } from '@/user/user.entity';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRole.Admin)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('tables')
  getTables() {
    return this.adminService.getTables();
  }
}
