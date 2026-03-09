import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { CategoryController } from './controller/controller.category';
import { CategoryService } from './service/category.service';
import { Category } from './entity/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-scret-key',
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN) || 23,
      },
    }),
    AuthModule,
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
