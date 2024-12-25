import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, BadRequestException, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SkillLevel } from '../common/enums/skill.enum';
import { UpdateSkillExpectationDto } from './dto/manager-dashboard.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get role-based dashboard data' })
  @ApiResponse({ status: 200, description: 'Returns dashboard data based on user role' })
  async getDashboard(@Request() req) {
    const { role, id } = req.user;
    
    switch(role) {
      case 'admin':
        return this.dashboardService.getAdminDashboard();
      case 'manager':
        return this.dashboardService.getManagerDashboard(id);
      case 'employee':
        return this.dashboardService.getEmployeeDashboard(id);
      default:
        throw new BadRequestException('Invalid role');
    }
  }

  // Admin specific endpoints
  @Get('admin/metrics')
  @Roles('admin')
  @ApiOperation({ summary: 'Get overall metrics (Admin only)' })
  getAdminMetrics() {
    return this.dashboardService.getDashboardMetrics();
  }

  @Get('admin/employee-matrix')
  @Roles('admin')
  @ApiOperation({ summary: 'Get employee matrix (Admin only)' })
  async getEmployeeMatrix() {
    return this.dashboardService.getEmployeeMatrix();
  }

  @Get('skill-directory')
  @Roles('admin')
  @ApiOperation({ summary: 'Get skill directory (Admin only)' })
  async getSkillDirectory() {
    return this.dashboardService.getSkillDirectory();
  }

  @Get('admin/skill-gaps')
  @Roles('admin')
  @ApiOperation({ summary: 'Get organization-wide skill gaps (Admin only)' })
  getSkillGapAnalysis() {
    return this.dashboardService.getSkillGapAnalysis();
  }

  @Get('admin/department-heatmap')
  @Roles('admin')
  @ApiOperation({ summary: 'Get department skills heatmap (Admin only)' })
  getDepartmentSkillsHeatmap() {
    return this.dashboardService.getDepartmentSkillsHeatmap();
  }

  // Manager specific endpoints
  @Get('manager/overview')
  @Roles('manager')
  @ApiOperation({ summary: 'Get manager dashboard overview' })
  getManagerOverview(@Request() req) {
    return this.dashboardService.getManagerDashboard(req.user.id);
  }

  @Get('manager/team-skills')
  @Roles('manager')
  @ApiOperation({ summary: 'Get team skill overview' })
  getTeamSkillOverview(@Request() req) {
    return this.dashboardService.getTeamSkillOverview(req.user.id);
  }

  @Get('manager/team-members')
  @Roles('manager')
  @ApiOperation({ summary: 'Get list of team members for manager' })
  async getTeamMembers(@Request() req) {
    return this.dashboardService.getTeamMembers(req.user.id);
  }

  @Get('manager/team-users-by-skill')
  @Roles('manager')
  @ApiOperation({ summary: 'Get team users by skill for manager' })
  async getTeamUsersBySkill(@Request() req, @Query('skillId') skillId: string) {
    return this.dashboardService.getTeamUsersBySkill(req.user.id, skillId);
  }

  @Post('manager/skill-expectation')
  @Roles('manager')
  @ApiOperation({ summary: 'Update skill expectation for team member' })
  updateSkillExpectation(@Request() req, @Body() dto: UpdateSkillExpectationDto) {
    return this.dashboardService.updateSkillExpectation(dto, req.user.id);
  }

  // Employee specific endpoints
  @Get('employee/overview')
  @Roles('employee', 'admin', 'manager')
  @ApiOperation({ summary: 'Get employee dashboard overview' })
  getEmployeeOverview(@Request() req) {
    return this.dashboardService.getEmployeeDashboard(req.user.id);
  }

  // New Skill Overview Endpoints
  @Get('skills/overview')
  @ApiOperation({ summary: 'Get detailed skill overview for current user' })
  @ApiResponse({ status: 200, description: 'Returns detailed skill overview' })
  async getSkillOverview(@Request() req) {
    return this.dashboardService.getEmployeeSkillOverview(req.user.id);
  }

  @Get('team/skills/overview')
  @Roles('manager', 'admin')
  @ApiOperation({ summary: 'Get detailed skill overview for team members' })
  @ApiResponse({ status: 200, description: 'Returns team skill overview' })
  async getDetailedTeamSkillOverview(@Request() req) {
    return this.dashboardService.getTeamSkillOverview(req.user.id);
  }

  @Post('skills')
  @ApiOperation({ summary: 'Add new skill assessment' })
  @ApiResponse({ status: 201, description: 'Skill assessment created' })
  async addNewSkill(
    @Request() req,
    @Body() body: {
      skillId: string;
      currentLevel: SkillLevel;
      certificationName?: string;
      certificationUrl?: string;
    },
  ) {
    return this.dashboardService.addNewSkill(
      req.user.id,
      body.skillId,
      body.currentLevel,
      body.certificationName,
      body.certificationUrl,
    );
  }

  @Put('skills/:id')
  @ApiOperation({ summary: 'Update skill assessment' })
  @ApiResponse({ status: 200, description: 'Skill assessment updated' })
  async updateSkill(
    @Param('id') id: string,
    @Body() body: {
      currentLevel: SkillLevel;
      certificationName?: string;
      certificationUrl?: string;
    },
  ) {
    return this.dashboardService.updateSkillAssessment(
      id,
      body.currentLevel,
      body.certificationName,
      body.certificationUrl,
    );
  }

  @Get('employee/tickets')
  @Roles('employee')
  @ApiOperation({ summary: 'Get employee help desk tickets' })
  getEmployeeTickets(@Request() req) {
    return this.dashboardService.getEmployeeTickets(req.user.id);
  }
} 