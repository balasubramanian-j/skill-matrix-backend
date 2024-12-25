import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  UseGuards, 
  Request, 
  Delete
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SkillsService } from './skills.service';
import { CreateSkillAssessmentDto, UpdateSkillAssessmentDto } from './dto/skill-assessment.dto';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Skills')
@Controller('skills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new skill' })
  @ApiResponse({ status: 201, description: 'Skill created successfully' })
  @Roles('admin')
  async createSkill(
    @Request() req,
    @Body() createDto: CreateSkillDto,
  ) {
    return this.skillsService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all skills' })
  @ApiResponse({ status: 200, description: 'Returns all skills' })
  @Roles('admin')
  async getAllSkills() {
    return this.skillsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specific skill' })
  @ApiResponse({ status: 200, description: 'Returns specific skill' })
  @Roles('admin')
  async getSkill(
    @Param('id') id: string,
  ) {
    return this.skillsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update skill' })
  @ApiResponse({ status: 200, description: 'Skill updated successfully' })
  @Roles('admin')
  async updateSkill(
    @Param('id') id: string,
    @Body() updateDto: UpdateSkillDto,
  ) {
    return this.skillsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete skill' })
  @ApiResponse({ status: 200, description: 'Skill deleted successfully' })
  @Roles('admin')
  async deleteSkill(
    @Param('id') id: string,
  ) {
    return this.skillsService.remove(id);
  }

  @Post('assessments')
  @ApiOperation({ summary: 'Create new skill assessment' })
  @ApiResponse({ status: 201, description: 'Assessment created successfully' })
  async createAssessment(
    @Request() req,
    @Body() createDto: CreateSkillAssessmentDto,
  ) {
    return this.skillsService.addSkillAssessment(req.user.id, createDto);
  }

  @Put('assessments/:id')
  @ApiOperation({ summary: 'Update skill assessment' })
  @ApiResponse({ status: 200, description: 'Assessment updated successfully' })
  async updateAssessment(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateSkillAssessmentDto,
  ) {
    return this.skillsService.updateSkillAssessment(id, req.user.id, updateDto);
  }

  @Get('assessments')
  @ApiOperation({ summary: 'Get all skill assessments' })
  @ApiResponse({ status: 200, description: 'Returns all assessments' })
  async getAssessments(@Request() req) {
    return this.skillsService.getSkillAssessments(req.user.id);
  }

  @Get('assessments/:id')
  @ApiOperation({ summary: 'Get specific skill assessment' })
  @ApiResponse({ status: 200, description: 'Returns specific assessment' })
  async getAssessment(
    @Request() req,
    @Param('id') id: string,
  ) {
    return this.skillsService.getSkillAssessment(id, req.user.id);
  }
} 