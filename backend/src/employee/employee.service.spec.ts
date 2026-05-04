import { ConfigService } from '@nestjs/config';
import { EmployeeService } from './employee.service';
import { IEmployee } from './interfaces/employee.interface';
import { User } from '@/user/user.entity';
import { UserService } from '@/user/user.service';

describe('EmployeeService', () => {
  describe('syncEmployeeNames', () => {
    it('waits for user saves before resolving', async () => {
      const user = new User();
      user.id = 1;
      user.employee_id = 'employee-1';
      user.name = 'Old Name';

      let resolveSave: () => void;
      const savePromise = new Promise<void>(resolve => {
        resolveSave = resolve;
      });
      const saveUser = jest.fn().mockReturnValue(savePromise);

      const userService = {
        getUsers: jest.fn().mockResolvedValue([user]),
        saveUser,
      } as unknown as UserService;

      const service = new EmployeeService({} as ConfigService, userService);
      const employee: IEmployee = {
        id: 'employee-1',
        email: 'employee-1@example.com',
        name: 'New Name',
        photoUrl: 'https://example.com/photo.png',
      };
      jest.spyOn(service, 'getEmployee').mockResolvedValue(employee);

      let syncResolved = false;
      const syncPromise = service.syncEmployeeNames().then(() => {
        syncResolved = true;
      });

      await Promise.resolve();
      await Promise.resolve();

      expect(user.name).toBe('New Name');
      expect(saveUser).toHaveBeenCalledWith(user);
      expect(syncResolved).toBe(false);

      resolveSave!();
      await syncPromise;

      expect(syncResolved).toBe(true);
    });

    it('does not save users without a matching employee', async () => {
      const user = new User();
      user.id = 1;
      user.employee_id = 'missing-employee';
      user.name = 'Existing Name';
      const saveUser = jest.fn();

      const userService = {
        getUsers: jest.fn().mockResolvedValue([user]),
        saveUser,
      } as unknown as UserService;

      const service = new EmployeeService({} as ConfigService, userService);
      jest.spyOn(service, 'getEmployee').mockResolvedValue(null);

      await service.syncEmployeeNames();

      expect(user.name).toBe('Existing Name');
      expect(saveUser).not.toHaveBeenCalled();
    });
  });
});
