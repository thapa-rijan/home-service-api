import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { File } from './entity/file.entity';
import { FileuploadController } from './controller/fileupload.controller';
import { FileuploadService } from './service/fileUpload.service';
import { CloudinaryService } from './service/cloudinary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: {
        expiresIn: Number(process.env.JWT_EXPIRES_IN) || 23,
      },
    }),
    AuthModule,
  ],
  controllers: [FileuploadController],
  providers: [FileuploadService, CloudinaryService],
  exports: [FileuploadService],
})
export class FileUploadModule {}
