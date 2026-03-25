import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpVerificationController } from './controller/otp-verification.controller';
import { OtpVerification } from './entity/otp-verification.entity';
import { OtpVerificationService } from './service/otp-verification.service';
import { SmtpEmailService } from './service/smtp-email.service';

@Module({
  imports: [TypeOrmModule.forFeature([OtpVerification])],
  controllers: [OtpVerificationController],
  providers: [OtpVerificationService, SmtpEmailService],
  exports: [OtpVerificationService],
})
export class OtpVerificationModule {}
