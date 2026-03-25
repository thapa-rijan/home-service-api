import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequestEmailOtpDto } from '../dto/request-email-otp.dto';
import { VerifyEmailOtpDto } from '../dto/verify-email-otp.dto';
import { OtpVerificationService } from '../service/otp-verification.service';

@ApiTags('OTP')
@Controller('otp')
export class OtpVerificationController {
  constructor(
    private readonly otpVerificationService: OtpVerificationService,
  ) {}

  @Post('email-otp/request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request email OTP' })
  @ApiResponse({
    status: 201,
    description: 'OTP generated and stored successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid payload',
  })
  async requestEmailOtp(@Body() requestOtpDto: RequestEmailOtpDto) {
    return this.otpVerificationService.requestEmailOtp(requestOtpDto);
  }

  @Post('email-otp/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify email OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - OTP expired, exceeded attempts, or not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid OTP',
  })
  async verifyEmailOtp(@Body() verifyOtpDto: VerifyEmailOtpDto) {
    return this.otpVerificationService.verifyEmailOtp(verifyOtpDto);
  }
}
