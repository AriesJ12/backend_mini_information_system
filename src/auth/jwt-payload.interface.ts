import { Role } from '../../generated/prisma/client';// wherever your Role enum is

export interface JwtPayload {
  sub: string;   // user ID
  email: string;
  role: Role;
}