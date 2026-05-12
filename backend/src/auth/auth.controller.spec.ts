import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { UserService, UpsertResult } from '@/user/user.service';
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
  Pick<UserService, 'upsertByGoogleWorkspaceToken'>
> = {
  upsertByGoogleWorkspaceToken: jest.fn(),
};

const mockAuthService: jest.Mocked<Pick<AuthService, 'revokeRefreshTokens'>> = {
  revokeRefreshTokens: jest.fn(),
};

describe('AuthController', (): void => {
  let controller: AuthController;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
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
    it('should return user response dto when found or created', async (): Promise<void> => {
      const result: UpsertResult = { user: mockUser };
      mockUserService.upsertByGoogleWorkspaceToken.mockResolvedValue(result);

      const response = await controller.login({
        firebaseUser: mockFirebaseToken,
      });

      expect(mockUserService.upsertByGoogleWorkspaceToken).toHaveBeenCalledWith(
        mockFirebaseToken
      );
      expect(response).toEqual({
        id: 1,
        name: 'Test User',
        role: UserRole.User,
      });
    });

    it('should throw NotFoundException when user not in employee directory', async (): Promise<void> => {
      const result: UpsertResult = { error: 'not-in-directory' };
      mockUserService.upsertByGoogleWorkspaceToken.mockResolvedValue(result);

      await expect(
        controller.login({ firebaseUser: mockFirebaseToken })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when token has no Google identity', async (): Promise<void> => {
      const result: UpsertResult = { error: 'no-google-identity' };
      mockUserService.upsertByGoogleWorkspaceToken.mockResolvedValue(result);

      await expect(
        controller.login({ firebaseUser: mockFirebaseToken })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('logout', (): void => {
    it('should revoke the current user refresh tokens', async (): Promise<void> => {
      mockAuthService.revokeRefreshTokens.mockResolvedValue();

      await controller.logout({ firebaseUser: mockFirebaseToken });

      expect(mockAuthService.revokeRefreshTokens).toHaveBeenCalledWith(
        mockFirebaseToken.uid
      );
    });
  });

  describe('getMe', (): void => {
    it('should return user response dto when found', async (): Promise<void> => {
      const result: UpsertResult = { user: mockUser };
      mockUserService.upsertByGoogleWorkspaceToken.mockResolvedValue(result);

      const response = await controller.getMe({
        firebaseUser: mockFirebaseToken,
      });

      expect(mockUserService.upsertByGoogleWorkspaceToken).toHaveBeenCalledWith(
        mockFirebaseToken
      );
      expect(response).toEqual({
        id: 1,
        name: 'Test User',
        role: UserRole.User,
      });
    });

    it('should throw NotFoundException when user not in directory', async (): Promise<void> => {
      const result: UpsertResult = { error: 'not-in-directory' };
      mockUserService.upsertByGoogleWorkspaceToken.mockResolvedValue(result);

      await expect(
        controller.getMe({ firebaseUser: mockFirebaseToken })
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when token has no Google identity', async (): Promise<void> => {
      const result: UpsertResult = { error: 'no-google-identity' };
      mockUserService.upsertByGoogleWorkspaceToken.mockResolvedValue(result);

      await expect(
        controller.getMe({ firebaseUser: mockFirebaseToken })
      ).rejects.toThrow(BadRequestException);
    });
  });
});
