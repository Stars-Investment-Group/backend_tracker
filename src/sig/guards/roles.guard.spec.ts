import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { RoleUser } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user: any): ExecutionContext => {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('devrait autoriser si aucun rôle requis', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
    const context = createMockExecutionContext({ role: RoleUser.USER });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('devrait autoriser si utilisateur a le rôle requis', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleUser.ADMIN]);
    const context = createMockExecutionContext({ role: RoleUser.ADMIN });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('devrait refuser si utilisateur a un rôle non autorisé', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleUser.ADMIN]);
    const context = createMockExecutionContext({ role: RoleUser.USER });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('devrait refuser si aucun utilisateur attaché à la requête', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([RoleUser.ADMIN]);
    const context = createMockExecutionContext(null);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
