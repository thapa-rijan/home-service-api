import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { OtpVerification } from '../entity/otp-verification.entity';
import { RequestEmailOtpDto } from '../dto/request-email-otp.dto';
import { VerifyEmailOtpDto } from '../dto/verify-email-otp.dto';
import { SmtpEmailService } from './smtp-email.service';

@Injectable()
export class OtpVerificationService {
  private readonly maxAttempts: number;
  private readonly otpExpiryInMinutes: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(OtpVerification)
    private readonly otpRepository: Repository<OtpVerification>,
    private readonly smtpEmailService: SmtpEmailService,
  ) {
    this.maxAttempts = Number(
      this.configService.get<string>('OTP_MAX_ATTEMPTS') ?? 5,
    );
    this.otpExpiryInMinutes = Number(
      this.configService.get<string>('OTP_EXPIRY_MINUTES') ?? 3,
    );
  }

  async requestEmailOtp(
    requestOtpDto: RequestEmailOtpDto,
  ): Promise<{ message: string; data: object }> {
    const email = requestOtpDto.email.trim().toLowerCase();
    const otpCode = this.generateOtpCode();
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    const expiresAt = new Date(
      Date.now() + this.otpExpiryInMinutes * 60 * 1000,
    );

    const otpEntity = this.otpRepository.create({
      userId: requestOtpDto.userId ?? null,
      email,
      otp: hashedOtp,
      purpose: requestOtpDto.purpose,
      expiresAt,
      verifiedAt: null,
      attemptCount: 0,
    });

    const savedOtp = await this.otpRepository.save(otpEntity);

    await this.smtpEmailService.sendOtpEmail({
      email,
      otpCode,
      purpose: savedOtp.purpose,
      expiryInMinutes: this.otpExpiryInMinutes,
    });

    const shouldExposeOtp =
      this.configService.get<string>('NODE_ENV') !== 'production';

    return {
      message: 'OTP generated and sent successfully',
      data: {
        otpId: savedOtp.id,
        email: savedOtp.email,
        purpose: savedOtp.purpose,
        expiresAt: savedOtp.expiresAt,
        emailSent: true,
        ...(shouldExposeOtp ? { otp: otpCode } : {}),
      },
    };
  }

  async verifyEmailOtp(
    verifyOtpDto: VerifyEmailOtpDto,
  ): Promise<{ message: string; data: object }> {
    const email = verifyOtpDto.email.trim().toLowerCase();
    const whereCondition: FindOptionsWhere<OtpVerification> = {
      email,
      purpose: verifyOtpDto.purpose,
      verifiedAt: IsNull(),
    };

    if (verifyOtpDto.userId) {
      whereCondition.userId = verifyOtpDto.userId;
    }

    const latestOtp = await this.otpRepository.findOne({
      where: whereCondition,
      order: { createdAt: 'DESC' },
    });

    if (!latestOtp) {
      throw new BadRequestException(
        'No active OTP request found for this email',
      );
    }

    if (latestOtp.attemptCount >= this.maxAttempts) {
      throw new BadRequestException(
        `Maximum verification attempts exceeded (${this.maxAttempts})`,
      );
    }

    if (latestOtp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('OTP has expired');
    }

    const isOtpValid = await bcrypt.compare(verifyOtpDto.otp, latestOtp.otp);

    if (!isOtpValid) {
      latestOtp.attemptCount += 1;
      await this.otpRepository.save(latestOtp);
      throw new UnauthorizedException('Invalid OTP');
    }

    latestOtp.attemptCount += 1;
    latestOtp.verifiedAt = new Date();
    const verifiedOtp = await this.otpRepository.save(latestOtp);

    return {
      message: 'OTP verified successfully',
      data: {
        otpId: verifiedOtp.id,
        email: verifiedOtp.email,
        purpose: verifiedOtp.purpose,
        verifiedAt: verifiedOtp.verifiedAt,
        attempts: verifiedOtp.attemptCount,
      },
    };
  }

  private generateOtpCode(): string {
    const min = 100000;
    const max = 999999;
    return String(Math.floor(Math.random() * (max - min + 1)) + min);
  }
}
