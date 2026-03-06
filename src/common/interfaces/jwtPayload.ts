import { RoleEnum } from '../enum/role.enum';

export interface JwtPayload {
  sub: string; // User ID
  name: string;
  role: RoleEnum;
  address?: string;
}
