import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { OtpPurpose } from '../enum/otp-purpose.enum';

@Injectable()
export class SmtpEmailService {
  private readonly logger = new Logger(SmtpEmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async sendOtpEmail(params: {
    email: string;
    otpCode: string;
    purpose: OtpPurpose;
    expiryInMinutes: number;
  }): Promise<void> {
    const nodeEnv =
      this.configService.get<string>('NODE_ENV')?.trim().toLowerCase() ??
      'development';
    const host = this.configService.get<string>('SMTP_HOST');
    const port = Number(this.configService.get<string>('SMTP_PORT') ?? 587);
    const secure =
      this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465;
    const tlsRejectUnauthorizedRaw = this.configService
      .get<string>('SMTP_TLS_REJECT_UNAUTHORIZED')
      ?.trim()
      .toLowerCase();
    const tlsRejectUnauthorized =
      tlsRejectUnauthorizedRaw === undefined
        ? nodeEnv === 'production'
        : tlsRejectUnauthorizedRaw !== 'false';
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const from =
      this.configService.get<string>('SMTP_FROM') ??
      this.configService.get<string>('SMTP_USER');

    if (!host || !port || !user || !pass || !from) {
      throw new InternalServerErrorException(
        'SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.',
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: tlsRejectUnauthorized,
      },
    });

    const purposeLabel = params.purpose
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
    const subject = `Your ${purposeLabel} OTP Code`;
    const textContent = [
      'Home Service OTP Verification',
      '',
      `OTP Code: ${params.otpCode}`,
      `Purpose: ${purposeLabel}`,
      `Expires in: ${params.expiryInMinutes} minutes`,
      '',
      'Do not share this code with anyone.',
      'If you did not request this OTP, please ignore this email.',
    ].join('\n');

    const htmlContent = `
<div style="margin:0; padding:24px; background:#f3f6fb; font-family:Segoe UI, Helvetica, Arial, sans-serif; color:#0f172a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:14px; border:1px solid #dbe5f3; overflow:hidden;">
    <tr>
      <td style="padding:22px 24px; background:linear-gradient(135deg, #0f766e 0%, #0369a1 100%); color:#ffffff;">
        <div style="font-size:12px; letter-spacing:1px; opacity:0.9; text-transform:uppercase;">Home Service</div>
        <div style="margin-top:6px; font-size:22px; font-weight:700;">OTP Verification</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 10px; font-size:14px; color:#334155;">Use the code below to complete <strong>${purposeLabel}</strong>.</p>
        <div style="margin:14px 0 18px; padding:14px 16px; border:1px dashed #7dd3fc; background:#f0f9ff; border-radius:12px; text-align:center;">
          <div style="font-size:11px; color:#0c4a6e; text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">One-Time Password</div>
          <div style="font-size:34px; line-height:1; font-weight:800; letter-spacing:6px; color:#0f172a;">${params.otpCode}</div>
        </div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:14px;">
          <tr>
            <td style="padding:10px 12px; border:1px solid #e2e8f0; border-radius:8px; font-size:13px; color:#334155;">Expires in <strong>${params.expiryInMinutes} minutes</strong></td>
          </tr>
        </table>
        <p style="margin:0; font-size:12px; color:#64748b;">For security, never share this OTP with anyone. Home Service support will never ask for this code.</p>
      </td>
    </tr>
    <tr>
      <td style="padding:14px 24px 22px; font-size:11px; color:#94a3b8; border-top:1px solid #eef2f7;">
        If you did not request this OTP, you can ignore this email.
      </td>
    </tr>
  </table>
</div>`;

    try {
      await transporter.sendMail({
        from,
        to: params.email,
        subject,
        text: textContent,
        html: htmlContent,
      });
    } catch (error) {
      this.logger.error('Failed to send OTP email', error as Error);
      throw new InternalServerErrorException(
        'Failed to send OTP email. Check SMTP credentials and provider settings.',
      );
    }
  }
}
