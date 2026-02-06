import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/signin.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: Partial<AuthService>;

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('signIn', () => {
    it('should call authService.login and return access token', async () => {
      const dto: SignInDto = { email: 'test@example.com', password: 'pass123' };
      const result = { access_token: 'jwt-token' };
      (authService.login as jest.Mock).mockResolvedValue(result);

      expect(await authController.signIn(dto)).toEqual(result);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('signOut', () => {
    it('should return logout message', () => {
      expect(authController.signOut()).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('getInfo', () => {
    it('should return user info from request', () => {
      const mockRequest = { user: { id: '1', email: 'test@example.com' } };
      expect(authController.getInfo(mockRequest as any)).toEqual(mockRequest.user);
    });
  });
});