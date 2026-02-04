import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { admin_directory_v1, google } from 'googleapis';
import { IEmployee } from './interfaces/employee.interface';
import { UserService } from '@/user/user.service';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) {}

  private async getAdmin(): Promise<admin_directory_v1.Admin> {
    const jwtAuth = new google.auth.JWT({
      scopes: ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      subject: 'admin@profiq.com',
    });
    const admin = google.admin({ version: 'directory_v1', auth: jwtAuth });
    return admin;
  }

  async getEmployees(): Promise<IEmployee[]> {
    const admin = await this.getAdmin();
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
    const admin = await this.getAdmin();

    // viewType domain_public provides the public information,
    // for more Administrative info, set this to 'admin_view'
    const viewType = 'domain_public';
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
    const employee: IEmployee = {
      id: res.data.id,
      email: res.data.primaryEmail || '',
      name: res.data.name?.fullName || '',
      photoUrl: res.data.thumbnailPhotoUrl || '',
    };
    return employee;
  }

  async syncEmployeeNames() {
    const users = await this.userService.getUsers();
    for (const user of users) {
      const employee = await this.getEmployee(user.employee_id);
      if (!employee) {
        continue;
      }
      user.name = employee.name;
      this.userService.saveUser(user);
    }
  }
}
