import { ApiProperty } from '@nestjs/swagger';
import { LoginDataDto } from './login-data.dto';

export class LoginResponseDto {
  @ApiProperty({ example: 'Login successful' })
  message: string;

  @ApiProperty({ type: LoginDataDto })
  data: LoginDataDto;
}
