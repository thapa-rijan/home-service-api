import { Request } from 'express';
import { JwtPayload } from './jwtPayload';



export interface AuthUser extends Request {
  user: JwtPayload;
}
