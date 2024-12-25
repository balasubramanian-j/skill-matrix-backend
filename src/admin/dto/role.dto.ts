import { IsNotEmpty, IsString, IsArray, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Permission } from '../../entities/role.entity';

export class CreateRoleDto {
  @ApiProperty({ example: 'TEAM_LEAD', description: 'Unique role name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ 
    enum: Permission,
    isArray: true,
    example: ['create_user', 'update_user'],
    description: 'List of permissions for this role'
  })
  @IsArray()
  @IsEnum(Permission, { each: true })
  permissions: Permission[];

  @ApiPropertyOptional({ example: 'Team lead role with user management permissions' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignRoleDto {
  @ApiProperty({ example: 'role-uuid', description: 'Role ID to assign' })
  @IsNotEmpty()
  @IsString()
  roleId: string;

  @ApiProperty({ example: ['user-uuid-1', 'user-uuid-2'], description: 'List of user IDs' })
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}

export class BulkUploadDto {
  @ApiProperty({ 
    type: 'string',
    format: 'binary',
    description: 'CSV file with user role mappings'
  })
  file: any;
} 