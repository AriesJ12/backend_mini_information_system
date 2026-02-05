import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../../generated/prisma/client';

@Injectable()
export class AuthService {
    constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.signToken(user.id, user.email, user.role);
  }

  private signToken(
    userId: string,
    email: string,
    role: Role,
  ) {
    const payload = {
      sub: userId,
      email,
      role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
