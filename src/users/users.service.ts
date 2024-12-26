import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { SkillLevel } from '../common/enums/skill.enum';
import { SkillAssessment } from '../entities/skill-assessment.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(SkillAssessment)
    private skillAssessmentRepository: Repository<SkillAssessment>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { employeeCode: createUserDto.employeeCode },
        { officialEmail: createUserDto.officialEmail },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User already exists with this employee code or email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['reportingManager', 'functionalManager'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['reportingManager', 'functionalManager', 'skillAssessments', 'skillAssessments.skill'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  } 

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { officialEmail: email },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If password is being updated, hash it
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softRemove(user);
  }

  async deactivate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = false;
    return this.usersRepository.save(user);
  }

  async activate(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = true;
    return this.usersRepository.save(user);
  }

  async updateTeamMemberSkillLevel(
    managerId: string,
    memberId: string,
    skillId: string,
    expectedLevel: SkillLevel,
  ): Promise<SkillAssessment> {
    // Verify manager has access to this team member
    const teamMember = await this.usersRepository.findOne({
      where: { id: memberId, reportingManager: { id: managerId } },
      relations: ['reportingManager'],
    });

    if (!teamMember) {
      throw new ForbiddenException('You can only update skills for your team members');
    }

    // Find the skill assessment
    const skillAssessment = await this.skillAssessmentRepository.findOne({
      where: { userId: memberId, skillId },
    });

    if (!skillAssessment) {
      throw new NotFoundException('Skill assessment not found');
    }

    // Update expected level
    skillAssessment.expectedLevel = expectedLevel;
    
    // Save and return updated assessment
    return this.skillAssessmentRepository.save(skillAssessment);
  }
} 