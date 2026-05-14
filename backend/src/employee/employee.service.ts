import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { admin_directory_v1, google } from 'googleapis';
import { IEmployee } from './interfaces/employee.interface';
import { UserService } from '@/user/user.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmployeeService {
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {}

  private getAdmin(): admin_directory_v1.Admin {
    const jwtAuth = new google.auth.JWT({
      scopes: ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
      email: this.configService.get<string>('google.client_email'),
      key: this.configService.get<string>('google.private_key'),
      subject: 'admin@profiq.com',
    });

    return google.admin({ version: 'directory_v1', auth: jwtAuth });
  }

  async getEmployees(): Promise<IEmployee[]> {
    const admin = this.getAdmin();
    let pageToken: string | undefined;

    const employees: IEmployee[] = [];

    // viewType domain_public provides the public information,
    // for more Administrative info, set this to 'admin_view'
    const viewType = 'domain_public';

    do {
      const response = await admin.users.list({
        maxResults: 500,
        viewType,
        domain: 'profiq.com',
        orderBy: 'email',
        pageToken,
      });
      const users = response.data.users ?? [];
      pageToken = response.data.nextPageToken || undefined;
      for (const user of users) {
        employees.push({
          id: user.id!,
          email: user.primaryEmail || '',
          name: user.name?.fullName || '',
          photoUrl: user.thumbnailPhotoUrl || '',
        });
      }
    } while (pageToken);
    return employees;
  }

  async getEmployee(id: string): Promise<IEmployee | null> {
    const admin = this.getAdmin();

    // viewType domain_public provides the public information,
    // for more Administrative info, set this to 'admin_view'
    const viewType = 'domain_public';
    try {
      const res = await admin.users.get({
        userKey: id,
        viewType,
      });
      if (!res.data.id) {
        return null;
      }
      if (!res.data.primaryEmail?.endsWith('@profiq.com')) {
        return null;
      }

      return {
        id: res.data.id,
        email: res.data.primaryEmail || '',
        name: res.data.name?.fullName || '',
        photoUrl: res.data.thumbnailPhotoUrl || '',
      };
    } catch {
      return null;
    }
  }

  async syncEmployeeNames() {
    const [users, employees] = await Promise.all([
      this.userService.getUsers(),
      this.getEmployees(),
    ]);
    const employeesById = new Map(
      employees.map(employee => [employee.id, employee])
    );
    const usersToSave = users.filter(user => {
      const employee = employeesById.get(user.employee_id);
      if (!employee) {
        return false;
      }
      if (user.name === employee.name) {
        return false;
      }
      user.name = employee.name;
      return true;
    });
    if (usersToSave.length === 0) {
      return;
    }
    await this.userService.saveUsers(usersToSave);
  }
}
