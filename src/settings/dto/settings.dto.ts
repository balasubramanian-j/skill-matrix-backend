import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsBoolean, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
}

export enum FieldVisibility {
  ALL = 'all',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

export class CreateFieldDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ enum: FieldType })
  @IsEnum(FieldType)
  type: FieldType;

  @ApiProperty()
  @IsOptional()
  defaultValue?: string;

  @ApiProperty()
  @IsBoolean()
  required: boolean;

  @ApiProperty({ enum: FieldVisibility })
  @IsEnum(FieldVisibility)
  visibility: FieldVisibility;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  options?: string[]; // For SELECT type fields
}

export class UpdateFieldDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  newName: string;
}

export class EmployeeMovementDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  newManagerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  newDepartment?: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  effectiveDate: Date;
}

export class BulkMovementDto {
  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  employeeIds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  newManagerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  newDepartment?: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  effectiveDate: Date;
} 