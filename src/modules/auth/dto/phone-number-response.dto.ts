import { ApiProperty } from '@nestjs/swagger';

export class PhoneNumberResponseDto {
  @ApiProperty({ example: 'PH_Qj9yRrrhHr' })
  id: string;

  @ApiProperty({ example: '0412345678' })
  phoneNumber: string;

  @ApiProperty({ example: '2026-03-09T10:56:55.773Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-09T10:56:55.773Z' })
  updatedAt: string;
}