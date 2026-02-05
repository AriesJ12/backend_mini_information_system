import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/public/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //TODO validation
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post()
  login(@Body() signInDto: Record<string, any>) {
    return this.authService.login(signInDto.username, signInDto.password);
  }

  @Post()
  logout(){
    
  }
}
