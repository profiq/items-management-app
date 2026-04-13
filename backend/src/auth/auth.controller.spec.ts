import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { UserService } from '@/user/user.service';
import { User, UserRole } from '@/user/user.entity';
import type { DecodedIdToken } from 'firebase-admin/auth';

const mockUser: User = {
  id: 1,
  name: 'Test User',
  employee_id: 'google-workspace-uid',
  role: UserRole.User,
};

const mockFirebaseToken = {
  uid: 'firebase-uid',
  firebase: {
    identities: { 'google.com': ['google-workspace-uid'] },
  },
} as unknown as DecodedIdToken;

const mockUserService: jest.Mocked<
  Pick<
    UserService,
    'upsertByGoogleWorkspaceToken' | 'getUserByGoogleWorkspaceUid'
  >
> = {
  upsertByGoogleWorkspaceToken: jest.fn(),
  getUserByGoogleWorkspaceUid: jest.fn(),
};

describe('AuthController', (): void => {
  let controller: AuthController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', (): void => {
    expect(controller).toBeDefined();
  });

  describe('login', (): void => {
    it('should return user when found or created', async (): Promise<void> => {
      mockUserService.upsertByGoogleWorkspaceToken.mockResolvedValue(mockUser);

      const result = await controller.login({
        firebaseUser: mockFirebaseToken,
      });

      expect(mockUserService.upsertByGoogleWorkspaceToken).toHaveBeenCalledWith(
        mockFirebaseToken
      );
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundException when user not in employee directory', async (): Promise<void> => {
      mockUserService.upsertByGoogleWorkspaceToken.mockResolvedValue(null);

      await expect(
        controller.login({ firebaseUser: mockFirebaseToken })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('logout', (): void => {
    it('should return void', (): void => {
      expect(controller.logout()).toBeUndefined();
    });
  });

  describe('getMe', (): void => {
    it('should return current user when found', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(mockUser);

      const result = await controller.getMe({
        firebaseUser: mockFirebaseToken,
      });

      expect(mockUserService.getUserByGoogleWorkspaceUid).toHaveBeenCalledWith(
        mockFirebaseToken
      );
      expect(result).toBe(mockUser);
    });

    it('should throw NotFoundException when user not in DB', async (): Promise<void> => {
      mockUserService.getUserByGoogleWorkspaceUid.mockResolvedValue(null);

      await expect(
        controller.getMe({ firebaseUser: mockFirebaseToken })
      ).rejects.toThrow(NotFoundException);
    });
  });
});
