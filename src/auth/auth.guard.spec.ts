import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: Partial<JwtService>;
  let reflector: Partial<Reflector>;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
    };
    reflector = {
      getAllAndOverride: jest.fn(),
    };
    guard = new AuthGuard(jwtService as JwtService, reflector as Reflector);
  });

  const createExecutionContext = (headers = {}, isPublic = false) => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers,
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any; // cast to satisfy ExecutionContext
  };

  it('should allow access if route is public', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(true);
    const context = createExecutionContext();

    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException if no token', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const context = createExecutionContext({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(
      new Error('invalid token'),
    );

    const context = createExecutionContext({
      authorization: 'Bearer invalidtoken',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should attach user to request if token is valid', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
    const payload = { sub: 'user-1', email: 'test@example.com' };
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);

    const request: any = {
      headers: { authorization: 'Bearer validtoken' },
    };

    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;

    await guard.canActivate(context);

    expect(request.user).toEqual(payload);
  });

  it('should ignore non-Bearer token', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);

    const context = createExecutionContext({
      authorization: 'Basic sometoken',
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
