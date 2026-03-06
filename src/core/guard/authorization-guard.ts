/**
 * Database-driven authorization guard.
 * Checks the authorization table to verify the authenticated user's role
 * has permission for the requested route path + HTTP method.
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { AuthorizationService } from 'src/modules/auth/service/authorization.service';
import { JwtPayload } from 'src/common/interfaces/jwtPayload';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private readonly authorizationService: AuthorizationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user: JwtPayload;
      route: { path: string };
      method: string;
    }>();
    const user = request.user;
    const path = request.route.path;
    const method = request.method;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const isAuthorized = await this.authorizationService.isAuthorizedByRoleName(
      user.role,
      path,
      method,
    );

    if (!isAuthorized) {
      throw new ForbiddenException(
        'Access denied. You do not have permission to access this endpoint.',
      );
    }

    return true;
  }
}
