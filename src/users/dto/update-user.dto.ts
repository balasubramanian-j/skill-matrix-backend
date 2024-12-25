import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const)
) {
  @ApiPropertyOptional({ example: 'NewPassword@123', description: 'New password (if updating)' })
  @IsOptional()
  @IsString()
  password?: string;
} 