import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '@/user/user.entity';
import { UserService } from '@/user/user.service';
import { EmployeeService } from './employee.service';
import { IEmployee } from './interfaces/employee.interface';

const mockUsers: User[] = [
  {
    id: 1,
    name: 'Old Name',
    employee_id: 'employee-1',
    role: UserRole.User,
  },
  {
    id: 2,
    name: 'Already Current',
    employee_id: 'employee-2',
    role: UserRole.User,
  },
];

const mockEmployees: IEmployee[] = [
  {
    id: 'employee-1',
    email: 'employee-1@example.com',
    name: 'New Name',
    photoUrl: '',
  },
  {
    id: 'employee-2',
    email: 'employee-2@example.com',
    name: 'Already Current',
    photoUrl: '',
  },
];

describe('EmployeeService', (): void => {
  let service: EmployeeService;
  let mockUserService: jest.Mocked<Pick<UserService, 'getUsers' | 'saveUsers'>>;

  beforeEach((): void => {
    mockUserService = {
      getUsers: jest.fn(),
      saveUsers: jest.fn(),
    };
    service = new EmployeeService(
      {} as ConfigService,
      mockUserService as unknown as UserService
    );
  });

  describe('syncEmployeeNames', (): void => {
    it('should wait for user saves before resolving', async (): Promise<void> => {
      const user = {
        id: 1,
        name: 'Old Name',
        employee_id: 'employee-1',
        role: UserRole.User,
      };
      let resolveSave: () => void;
      const savePromise = new Promise<void>(resolve => {
        resolveSave = resolve;
      });
      mockUserService.getUsers.mockResolvedValue([user]);
      mockUserService.saveUsers.mockReturnValue(savePromise);
      jest.spyOn(service, 'getEmployees').mockResolvedValue([
        {
          id: 'employee-1',
          email: 'employee-1@example.com',
          name: 'New Name',
          photoUrl: '',
        },
      ]);

      let syncResolved = false;
      const syncPromise = service.syncEmployeeNames().then(() => {
        syncResolved = true;
      });

      await Promise.resolve();
      await Promise.resolve();

      expect(user.name).toBe('New Name');
      expect(mockUserService.saveUsers).toHaveBeenCalledWith([user]);
      expect(syncResolved).toBe(false);

      resolveSave!();
      await syncPromise;

      expect(syncResolved).toBe(true);
    });

    it('should collect updates and save them once', async (): Promise<void> => {
      mockUserService.getUsers.mockResolvedValue(
        mockUsers.map(user => ({ ...user }))
      );
      jest.spyOn(service, 'getEmployees').mockResolvedValue(mockEmployees);

      await service.syncEmployeeNames();

      expect(mockUserService.saveUsers).toHaveBeenCalledTimes(1);
      expect(mockUserService.saveUsers).toHaveBeenCalledWith([
        expect.objectContaining({ id: 1, name: 'New Name' }),
      ]);
    });

    it('should not save users without a matching employee', async (): Promise<void> => {
      const user = {
        id: 1,
        name: 'Existing Name',
        employee_id: 'missing-employee',
        role: UserRole.User,
      };
      mockUserService.getUsers.mockResolvedValue([user]);
      jest.spyOn(service, 'getEmployees').mockResolvedValue(mockEmployees);

      await service.syncEmployeeNames();

      expect(user.name).toBe('Existing Name');
      expect(mockUserService.saveUsers).not.toHaveBeenCalled();
    });

    it('should not save anything when employee lookup fails', async (): Promise<void> => {
      mockUserService.getUsers.mockResolvedValue(
        mockUsers.map(user => ({ ...user }))
      );
      jest
        .spyOn(service, 'getEmployees')
        .mockRejectedValue(new Error('Google Directory unavailable'));

      await expect(service.syncEmployeeNames()).rejects.toThrow(
        'Google Directory unavailable'
      );
      expect(mockUserService.saveUsers).not.toHaveBeenCalled();
    });
  });
});
