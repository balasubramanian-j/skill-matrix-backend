import { IsEmail, IsEnum, IsNotEmpty, IsString, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, UserRole } from '../../entities/user.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'SM1565', description: 'Unique employee code' })
  @IsNotEmpty()
  @IsString()
  employeeCode: string;

  @ApiProperty({ example: 'Welcome@123', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'Full name of employee' })
  @IsNotEmpty()
  @IsString()
  employeeName: string;

  @ApiProperty({ example: 'Engineering', description: 'Business unit name' })
  @IsNotEmpty()
  @IsString()
  businessUnit: string;

  @ApiProperty({ example: 'Development', description: 'Department name' })
  @IsNotEmpty()
  @IsString()
  department: string;

  @ApiPropertyOptional({ example: 'manager-uuid', description: 'ID of reporting manager' })
  @IsOptional()
  @IsString()
  reportingManagerId?: string;

  @ApiPropertyOptional({ example: 'manager-uuid', description: 'ID of functional manager' })
  @IsOptional()
  @IsString()
  functionalManagerId?: string;

  @ApiProperty({ example: 'john.doe@company.com', description: 'Official email address' })
  @IsNotEmpty()
  @IsEmail()
  officialEmail: string;

  @ApiProperty({ example: 'Senior Software Engineer', description: 'Job designation' })
  @IsNotEmpty()
  @IsString()
  designation: string;

  @ApiProperty({ enum: Gender, example: 'M', description: 'Gender (M/F/O)' })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({ enum: UserRole, example: 'employee', description: 'User role (admin/manager/employee)' })
  @IsNotEmpty()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: '2024-03-24', description: 'Date of joining (YYYY-MM-DD)' })
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  dateOfJoining: Date;
} 