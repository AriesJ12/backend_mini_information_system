import { Body, Controller, Post, HttpCode, HttpStatus, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/public/public.decorator';
import { SignInDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //TODO validation
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body(ValidationPipe) signInDto: SignInDto) {
    return this.authService.login(signInDto);
  }

  @Post()
  logout(){
    
  }
}
