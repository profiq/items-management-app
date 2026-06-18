import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { IdentityService } from './identity.service';
import { UserRole } from '@/user/user.entity';
import { ROLES_KEY } from './roles.decorator';

const mockIdentityService: jest.Mocked<
  Pick<IdentityService, 'getRoleByFirebaseUser'>
> = {
  getRoleByFirebaseUser: jest.fn(),
};

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

const buildContext = (firebaseUser: unknown): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ firebaseUser }),
    }),
  }) as unknown as ExecutionContext;

describe('RolesGuard', (): void => {
  let guard: RolesGuard;

  beforeEach(async (): Promise<void> => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: IdentityService, useValue: mockIdentityService },
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    jest.clearAllMocks();
  });

  it('should be defined', (): void => {
    expect(guard).toBeDefined();
  });

  it('should allow access when no roles are required', async (): Promise<void> => {
    mockReflector.getAllAndOverride.mockReturnValue(null);

    const result = await guard.canActivate(buildContext({}));

    expect(result).toBe(true);
  });

  it('should deny access when no firebaseUser on request', async (): Promise<void> => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.Admin]);

    const result = await guard.canActivate(buildContext(undefined));

    expect(result).toBe(false);
  });

  it('should deny access when user not found in DB', async (): Promise<void> => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.Admin]);
    mockIdentityService.getRoleByFirebaseUser.mockResolvedValue(null);

    const result = await guard.canActivate(buildContext({ uid: 'x' }));

    expect(result).toBe(false);
  });

  it('should deny access when user role does not match', async (): Promise<void> => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.Admin]);
    mockIdentityService.getRoleByFirebaseUser.mockResolvedValue(UserRole.User);

    const result = await guard.canActivate(buildContext({ uid: 'x' }));

    expect(result).toBe(false);
  });

  it('should allow access when user role matches', async (): Promise<void> => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.Admin]);
    mockIdentityService.getRoleByFirebaseUser.mockResolvedValue(UserRole.Admin);

    const result = await guard.canActivate(buildContext({ uid: 'x' }));

    expect(result).toBe(true);
  });

  it('should verify reflector is called with correct key', async (): Promise<void> => {
    mockReflector.getAllAndOverride.mockReturnValue([UserRole.User]);
    mockIdentityService.getRoleByFirebaseUser.mockResolvedValue(UserRole.User);
    const context = buildContext({ uid: 'x' });

    await guard.canActivate(context);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
  });
});
