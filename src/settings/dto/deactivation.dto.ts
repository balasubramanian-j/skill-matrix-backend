import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class DeactivateEmployeeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  effectiveDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkDeactivateDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  employeeIds: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  effectiveDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class SearchEmployeeDto {
  @ApiProperty()
  @IsString()
  searchTerm: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  department?: string;
} 