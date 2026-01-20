import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { Employee } from './interfaces/employee.interface';

@Injectable()
export class EmployeeService {
  async getEmployees(): Promise<Employee[]> {
    const jwtAuth = new google.auth.JWT({
      scopes: ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      subject: 'admin@profiq.com',
    });

    const admin = google.admin({ version: 'directory_v1', auth: jwtAuth });
    let pageToken: string | undefined;

    const employees: Employee[] = [];

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
}
