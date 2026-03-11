import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RoleEnum } from 'src/common/enum/role.enum';
import { IdentityProofType } from 'src/common/enum/identity-proof-type.enum';

export class IdentityProofDto {
  @ApiProperty({
    enum: IdentityProofType,
    example: IdentityProofType.CITIZENSHIP,
    description: 'Type of identity proof',
  })
  @IsEnum(IdentityProofType)
  type: IdentityProofType;

  @ApiProperty({
    example: 'xYzAbCdEfG',
    description: 'fileId returned from the file upload endpoint',
  })
  @IsString()
  @IsNotEmpty()
  fileId: string;
}

export class CompleteProfileDto {
  @ApiProperty({ example: 'Kathmandu, Nepal' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ enum: RoleEnum, example: RoleEnum.PROVIDER })
  @IsEnum(RoleEnum)
  role: RoleEnum;

  @ApiProperty({ example: 27.7172, description: 'Latitude (required)' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude: number;

  @ApiProperty({ example: 85.324, description: 'Longitude (required)' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude: number;

  @ApiProperty({ example: 'Plumbing', description: 'Service name' })
  @IsString()
  @IsNotEmpty()
  serviceName: string;

  @ApiProperty({ example: 3, description: 'Years of experience' })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  experienceYear: number;

  @ApiProperty({ example: '9800000000', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '09:00', description: 'Working hour start (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  workingHourFrom: string;

  @ApiProperty({ example: '18:00', description: 'Working hour end (HH:mm)' })
  @IsString()
  @IsNotEmpty()
  workingHourTo: string;

  @ApiProperty({
    type: [IdentityProofDto],
    description:
      'Identity proof documents — upload each file first via POST /uploadFile, then pass the returned fileId here',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdentityProofDto)
  identityProofs: IdentityProofDto[];
}
