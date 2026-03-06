import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/auth/entity/user.entity';
import { UserService } from './service/user.service';
import { UserController } from './controller/user.controller';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
