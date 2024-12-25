import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from '../entities/skill.entity';
import { SkillAssessment, AssessmentStatus } from '../entities/skill-assessment.entity';
import { User } from '../entities/user.entity';
import { CreateSkillAssessmentDto, UpdateSkillAssessmentDto } from './dto/skill-assessment.dto';
import { SkillLevel } from '../common/enums/skill.enum';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(SkillAssessment)
    private assessmentRepository: Repository<SkillAssessment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createSkillDto: CreateSkillDto): Promise<Skill> {
    const skill = this.skillRepository.create(createSkillDto);
    return this.skillRepository.save(skill);
  }

  async findAll(): Promise<Skill[]> {
    return this.skillRepository.find({
      relations: ['assessments'],
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Skill> {
    const skill = await this.skillRepository.findOne({
      where: { id },
      relations: ['assessments']
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async update(id: string, updateSkillDto: UpdateSkillDto): Promise<Skill> {
    const skill = await this.findOne(id);
    Object.assign(skill, updateSkillDto);
    return this.skillRepository.save(skill);
  }

  async remove(id: string): Promise<void> {
    const skill = await this.findOne(id);
    await this.skillRepository.remove(skill);
  }

  async addSkillAssessment(
    userId: string,
    createDto: CreateSkillAssessmentDto,
  ): Promise<SkillAssessment> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skill = await this.skillRepository.findOne({
      where: { id: createDto.skillId }
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const assessment = new SkillAssessment();
    assessment.userId = user.id;
    assessment.skillId = skill.id;
    assessment.currentLevel = createDto.currentLevel;
    assessment.expectedLevel = SkillLevel.INTERMEDIATE;
    assessment.status = AssessmentStatus.PENDING;
    assessment.certificationName = createDto.certificationName;
    assessment.certificationUrl = createDto.certificationUrl;

    return this.assessmentRepository.save(assessment);
  }

  async updateSkillAssessment(
    assessmentId: string,
    userId: string,
    updateDto: UpdateSkillAssessmentDto,
  ): Promise<SkillAssessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id: assessmentId, userId }
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    assessment.currentLevel = updateDto.currentLevel;
    if (updateDto.certificationName !== undefined) {
      assessment.certificationName = updateDto.certificationName;
    }
    if (updateDto.certificationUrl !== undefined) {
      assessment.certificationUrl = updateDto.certificationUrl;
    }

    return this.assessmentRepository.save(assessment);
  }

  async getSkillAssessments(userId: string): Promise<SkillAssessment[]> {
    return this.assessmentRepository.find({
      where: { userId },
      relations: ['skill'],
    });
  }

  async getSkillAssessment(assessmentId: string, userId: string): Promise<SkillAssessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id: assessmentId, userId },
      relations: ['skill'],
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    return assessment;
  }
} 