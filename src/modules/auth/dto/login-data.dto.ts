import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class LoginDataDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJBRC1JTWxpN0xRYnVhIiwibmFtZSI6IkhvbWUgU2VydmljZSBBZG1pbiIsInJvbGUiOiJBRE1JTiIsImFkZHJlc3MiOiJCYW5lcGEsIE5lcGFsIiwiaWF0IjoxNzczMDUzODI0LCJleHAiOjE3NzMwNTc0MjR9.5dgT7sk5JF2Wk0ptGA-jMIOldB2uLrzqMeroYWv_Ba8' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJBRC1JTWxpN0xRYnVhIiwibmFtZSI6IkhvbWUgU2VydmljZSBBZG1pbiIsInJvbGUiOiJBRE1JTiIsImFkZHJlc3MiOiJCYW5lcGEsIE5lcGFsIiwiaWF0IjoxNzczMDUzODI0LCJleHAiOjE3NzM2NTg2MjR9.cKVdCuXeHyUS7H4BohNfl_i4ABQm16ao8uIeazOACZY' })
  refreshToken: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}