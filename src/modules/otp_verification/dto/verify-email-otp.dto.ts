import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { OtpPurpose } from '../enum/otp-purpose.enum';

export class VerifyEmailOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: OtpPurpose, example: OtpPurpose.EMAIL_VERIFICATION })
  @IsEnum(OtpPurpose)
  purpose: OtpPurpose;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiPropertyOptional({
    example: 'c0779a5a-eb59-41df-ac38-a957894d152e',
    description: 'Optional user id associated with OTP request',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
