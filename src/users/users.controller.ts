import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateSkillExpectedLevelDto } from './dto/update-skill-expected-level.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation data',
    examples: {
      example1: {
        value: {
          employeeCode: "SM1565",
          password: "Welcome@123",
          employeeName: "John Doe",
          businessUnit: "Engineering",
          department: "Development",
          officialEmail: "john.doe@company.com",
          designation: "Senior Software Engineer",
          gender: "M",
          role: "employee",
          dateOfJoining: "2024-03-24"
        }
      }
    }
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data',
    examples: {
      example1: {
        value: {
          employeeName: "John Smith",
          designation: "Tech Lead",
          password: "NewPassword@123"
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiResponse({ status: 200, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user' })
  @ApiResponse({ status: 200, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }

  @Patch('team-members/:memberId/skills/:skillId')
  @Roles('manager')
  @ApiOperation({ summary: 'Update team member skill expected level' })
  @ApiResponse({ status: 200, description: 'Expected level updated successfully' })
  async updateTeamMemberSkillLevel(
    @Param('memberId') memberId: string,
    @Param('skillId') skillId: string,
    @Body() updateDto: UpdateSkillExpectedLevelDto,
    @Request() req,
  ) {
    return this.usersService.updateTeamMemberSkillLevel(
      req.user.id,
      memberId,
      skillId,
      updateDto.expectedLevel
    );
  }
} 