import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  IsOptional,
  IsEmail,
  IsArray,
  ArrayMinSize,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoleEnum } from 'src/common';

export class SignUpDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @Length(6, 20)
  password: string;

  @ApiProperty({ enum: RoleEnum, example: RoleEnum.CUSTOMER })
  @IsEnum(RoleEnum)
  role: RoleEnum;

  @ApiProperty({ example: 'Kathmandu, Nepal', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: ['9800000000', '9811111111'],
    description: 'List of phone numbers',
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  phoneNumbers: string[];

  // ── Provider-specific fields (required when role = PROVIDER) ──

  @ApiProperty({
    example: 3,
    required: false,
    description: 'Years of experience (provider only)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  experienceYear?: number;

  @ApiProperty({
    example: 25.5,
    required: false,
    description: 'Rate per hour in USD (provider only)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  ratePerHour?: number;

  @ApiProperty({
    example: 'Plumbing',
    required: false,
    description: 'Area of specialization (provider only)',
  })
  @IsOptional()
  @IsString()
  specialization?: string;
}
