import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { EmailDomainValidationService } from './service/validemail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { PhoneNumber } from './entity/phone-number.entity';
import { Provider } from './entity/provider.entity';
import { Authorization } from './entity/authorization';
import { Role } from './entity/role.entity';
import { AuthorizationService } from './service/authorization.service';
import { AuthorizationGuard } from 'src/core/guard/authorization-guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-scret-key',
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN) || 23,
      },
    }),
    TypeOrmModule.forFeature([
      User,
      PhoneNumber,
      Provider,
      Authorization,
      Role,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailDomainValidationService,
    AuthorizationService,
    AuthorizationGuard,
  ],
  exports: [AuthService, JwtModule, AuthorizationService, AuthorizationGuard],
})
export class AuthModule {}
