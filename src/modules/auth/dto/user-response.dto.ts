import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum, UserStatus } from 'src/common';

export class UserResponseDto {
  @ApiProperty({ example: 'AD-IMli7LQbua' })
  id: string;

  @ApiProperty({ example: 'Home Service Admin' })
  fullName: string;

  @ApiProperty({ example: 'admin@gmail.com' })
  email: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ enum: RoleEnum, example: RoleEnum.ADMIN })
  role: RoleEnum;
}
