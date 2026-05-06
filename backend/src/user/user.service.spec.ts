import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User, UserRole } from './user.entity';
import { EmployeeService } from '@/employee/employee.service';

const mockUser: User = {
  id: 1,
  name: 'Test User',
  employee_id: 'google-workspace-uid',
  role: UserRole.User,
};

const mockRepository: jest.Mocked<
  Pick<
    Repository<User>,
    'count' | 'find' | 'findOne' | 'findOneBy' | 'save' | 'delete'
  >
> = {
  count: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockEmployeeService: jest.Mocked<Pick<EmployeeService, 'getEmployee'>> = {
  getEmployee: jest.fn(),
};

describe('UserService', (): void => {
  let service: UserService;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockRepository },
        { provide: EmployeeService, useValue: mockEmployeeService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('should be defined', (): void => {
    expect(service).toBeDefined();
  });

  describe('getUserByGoogleWorkspaceUid', (): void => {
    it('should return user when google.com identity exists', async (): Promise<void> => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const token = {
        uid: 'firebase-uid',
        firebase: { identities: { 'google.com': ['google-workspace-uid'] } },
      };

      const result = await service.getUserByGoogleWorkspaceUid(token);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { employee_id: 'google-workspace-uid' },
      });
      expect(result).toBe(mockUser);
    });

    it('should return null when no google.com identity', async (): Promise<void> => {
      const token = { uid: 'firebase-uid', firebase: { identities: {} } };

      const result = await service.getUserByGoogleWorkspaceUid(token);

      expect(mockRepository.findOne).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when firebase field missing', async (): Promise<void> => {
      const token = { uid: 'firebase-uid' };

      const result = await service.getUserByGoogleWorkspaceUid(token);

      expect(result).toBeNull();
    });
  });

  describe('updateUserRole', (): void => {
    it('should update and return user with new role', async (): Promise<void> => {
      const updated: User = { ...mockUser, role: UserRole.Admin };
      mockRepository.findOne.mockResolvedValue({ ...mockUser });
      mockRepository.save.mockResolvedValue(updated);

      const result = await service.updateUserRole(1, UserRole.Admin);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.Admin })
      );
      expect(result?.role).toBe(UserRole.Admin);
    });

    it('should return null when user not found', async (): Promise<void> => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.updateUserRole(99, UserRole.Admin);

      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('deleteUser', (): void => {
    it('should delete a non-current user', async (): Promise<void> => {
      mockRepository.findOne.mockResolvedValue({ ...mockUser, id: 2 });
      mockRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.deleteUser(2, 1);

      expect(mockRepository.delete).toHaveBeenCalledWith({ id: 2 });
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when deleting yourself', async (): Promise<void> => {
      await expect(service.deleteUser(1, 1)).rejects.toThrow(
        ForbiddenException
      );

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when deleting the last admin', async (): Promise<void> => {
      mockRepository.findOne.mockResolvedValue({
        ...mockUser,
        id: 1,
        role: UserRole.Admin,
      });
      mockRepository.count.mockResolvedValue(1);

      await expect(service.deleteUser(1, 2)).rejects.toThrow(
        ForbiddenException
      );

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
