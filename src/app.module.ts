import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ProviderModule } from './modules/provider/provider.module';
import { CategoryModule } from './modules/category/category.module';
import { User } from './modules/auth/entity/user.entity';
import { PhoneNumber } from './modules/auth/entity/phone-number.entity';
import { Provider } from './modules/auth/entity/provider.entity';
import { Authorization } from './modules/auth/entity/authorization';
import { Role } from './modules/auth/entity/role.entity';
import { Category } from './modules/category/entity/category.entity';
import { Service } from './modules/services/entity/service.entity';
import { File } from './modules/fileUpload/entity/file.entity';
import { IdentityProof } from './modules/auth/entity/identity-proof.entity';
import { FileUploadModule } from './modules/fileUpload/fileUpload.module';
import { OtpVerification } from 'src/modules/otp_verification/entity/otp-verification.entity';
import { OtpVerificationModule } from './modules/otp_verification/otp-verification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        PhoneNumber,
        Provider,
        Authorization,
        Role,
        Category,
        Service,
        File,
        IdentityProof,
        OtpVerification,
      ],
      synchronize: true, // Set to false in production
      logging: false,
    }),
    AuthModule,
    UserModule,
    ProviderModule,
    CategoryModule,
    FileUploadModule,
    OtpVerificationModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
