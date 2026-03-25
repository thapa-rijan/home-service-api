import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { OtpPurpose } from '../enum/otp-purpose.enum';

export class RequestEmailOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: OtpPurpose, example: OtpPurpose.EMAIL_VERIFICATION })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;

  @ApiPropertyOptional({
    example: 'c0779a5a-eb59-41df-ac38-a957894d152e',
    description: 'Optional user id associated with OTP request',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
