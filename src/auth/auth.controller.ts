import { Body, Controller, Post, HttpCode, HttpStatus, ValidationPipe, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/public/public.decorator';
import { SignInDto } from './dto/signin.dto';
import { JwtPayload } from './jwt-payload.interface';

interface AuthRequest extends Request {
  user?: any; // or a specific User type
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // TODO
  @Get("me")
  getInfo(@Req() request: AuthRequest) {
    return request.user;
  }
  
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body(ValidationPipe) signInDto: SignInDto) {
    return this.authService.login(signInDto);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  signOut(){
    return { message: 'Logged out successfully' };
  }
}
