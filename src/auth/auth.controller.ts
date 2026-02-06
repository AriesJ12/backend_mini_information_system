import { Body, Controller, Post, ValidationPipe, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../public/public.decorator';
import { SignInDto } from './dto/signin.dto';

interface AuthRequest extends Request {
  user?: any; // or a specific User type
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  getInfo(@Req() request: AuthRequest) {
    return request.user;
  }
  
  @Public()
  @Post('login')
  signIn(@Body(ValidationPipe) signInDto: SignInDto) {
    return this.authService.login(signInDto);
  }

  @Post("logout")
  signOut(){
    return { message: 'Logged out successfully' };
  }
}
