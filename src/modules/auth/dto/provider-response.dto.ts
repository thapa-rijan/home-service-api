import { ApiProperty } from '@nestjs/swagger';

export class ProviderResponseDto {
  @ApiProperty({ example: 'PR_someId' })
  id: string;

  @ApiProperty({ example: 5 })
  experienceYear: number;

  @ApiProperty({ example: 50.00 })
  ratePerHour: number;

  @ApiProperty({ example: 'Plumbing', nullable: true })
  specialization: string | null;

  @ApiProperty({ example: 4.5 })
  rating: number;

  @ApiProperty({ example: 25 })
  jobCompleted: number;

  @ApiProperty({ example: '2026-03-09T10:56:55.773Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-03-09T10:56:55.773Z' })
  updatedAt: string;
}