import { ApiProperty } from '@nestjs/swagger';
import { RoleEnum, UserStatus } from 'src/common';
import { PhoneNumberResponseDto } from './phone-number-response.dto';
import { ProviderResponseDto } from './provider-response.dto';

export class UserResponseDto {
  @ApiProperty({ example: 'AD-IMli7LQbua' })
  id: string;

  @ApiProperty({ example: 'Home Service Admin' })
  fullName: string;

  @ApiProperty({ example: 'admin@gmail.com' })
  email: string;

  @ApiProperty({ example: 'Banepa, Nepal' })
  address: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.ACTIVE })
  status: UserStatus;

  @ApiProperty({ enum: RoleEnum, example: RoleEnum.ADMIN })
  role: RoleEnum;

  @ApiProperty({ type: [PhoneNumberResponseDto] })
  phoneNumbers: PhoneNumberResponseDto[];

  @ApiProperty({ type: ProviderResponseDto, nullable: true })
  provider: ProviderResponseDto | null;

  @ApiProperty({ example: '2026-03-09T10:56:55.766Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-09T10:56:55.766Z' })
  updatedAt: string;
}
