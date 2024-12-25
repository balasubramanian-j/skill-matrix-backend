import { Controller, Post, Body, UseGuards, UseInterceptors, UploadedFile, Patch, Param, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateRoleDto, AssignRoleDto, BulkUploadDto } from './dto/role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from './role.guard';
import { Roles } from './roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('roles')
  @Roles('admin')
  @ApiOperation({ summary: 'Create new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 409, description: 'Role already exists' })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.adminService.createRole(createRoleDto);
  }

  @Post('roles/assign')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign role to users' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'Role or users not found' })
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.adminService.assignRole(assignRoleDto);
  }

  @Post('roles/bulk-upload')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Bulk upload role assignments via CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'CSV file with role assignments',
    type: BulkUploadDto,
  })
  async bulkUploadRoles(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    try {
      return await this.adminService.bulkUploadRoles(file.buffer);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Patch('users/:userId/manager/:managerId')
  @Roles('admin')
  @ApiOperation({ summary: 'Update user reporting hierarchy' })
  @ApiResponse({ status: 200, description: 'Hierarchy updated successfully' })
  @ApiResponse({ status: 404, description: 'User or manager not found' })
  updateHierarchy(
    @Param('userId') userId: string,
    @Param('managerId') managerId: string,
    @Body('type') type: 'reporting' | 'functional'
  ) {
    return this.adminService.updateUserHierarchy(userId, managerId, type);
  }
} 