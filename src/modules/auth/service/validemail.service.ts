import { Injectable } from '@nestjs/common';
import { promises as dns } from 'dns';

@Injectable()
export class EmailDomainValidationService {
  async validateEmailDomain(email: string): Promise<boolean> {
    const domain = email.split('@')[1];

    if (!domain) {
      throw new Error('Invalid email format');
    }
    try {
      const mxRecords = await dns.resolveMx(domain);
      return mxRecords.length > 0;
    } catch (error) {
      return false;
    }
  }
}
