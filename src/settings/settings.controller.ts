import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateFieldDto, UpdateFieldDto, EmployeeMovementDto, BulkMovementDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RoleGuard } from '../admin/role.guard';
import { Roles } from '../admin/roles.decorator';
import { DeactivateEmployeeDto, BulkDeactivateDto, SearchEmployeeDto } from './dto/deactivation.dto';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post('fields')
  @Roles('admin')
  @ApiOperation({ summary: 'Create new custom field' })
  createField(@Body() createFieldDto: CreateFieldDto) {
    return this.settingsService.createField(createFieldDto);
  }

  @Put('fields/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update field name' })
  updateField(
    @Param('id') id: string,
    @Body() updateFieldDto: UpdateFieldDto,
  ) {
    return this.settingsService.updateField(id, updateFieldDto);
  }

  @Post('employee-movement')
  @Roles('admin')
  @ApiOperation({ summary: 'Move employee to new manager/department' })
  moveEmployee(@Body() movementDto: EmployeeMovementDto) {
    return this.settingsService.moveEmployee(movementDto);
  }

  @Post('bulk-movement')
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk move employees' })
  bulkMoveEmployees(@Body() bulkMovementDto: BulkMovementDto) {
    return this.settingsService.bulkMoveEmployees(bulkMovementDto);
  }

  @Get('fields')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all custom fields' })
  getCustomFields() {
    return this.settingsService.getCustomFields();
  }

  @Get('fields/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get field by ID' })
  getFieldById(@Param('id') id: string) {
    return this.settingsService.getFieldById(id);
  }

  @Delete('fields/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete custom field' })
  deleteField(@Param('id') id: string) {
    return this.settingsService.deleteField(id);
  }

  @Get('employees/search')
  @Roles('admin')
  @ApiOperation({ summary: 'Search active employees' })
  searchEmployees(@Query() searchDto: SearchEmployeeDto) {
    return this.settingsService.searchEmployees(searchDto);
  }

  @Post('employees/deactivate')
  @Roles('admin')
  @ApiOperation({ summary: 'Deactivate an employee' })
  deactivateEmployee(@Body() deactivateDto: DeactivateEmployeeDto) {
    return this.settingsService.deactivateEmployee(deactivateDto);
  }

  @Post('employees/bulk-deactivate')
  @Roles('admin')
  @ApiOperation({ summary: 'Bulk deactivate employees' })
  bulkDeactivateEmployees(@Body() bulkDeactivateDto: BulkDeactivateDto) {
    return this.settingsService.bulkDeactivateEmployees(bulkDeactivateDto);
  }

  @Get('employees/inactive')
  @Roles('admin')
  @ApiOperation({ summary: 'Get all inactive employees' })
  getInactiveEmployees() {
    return this.settingsService.getInactiveEmployees();
  }
} 