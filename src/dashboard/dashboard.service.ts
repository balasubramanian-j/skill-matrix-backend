import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Skill } from '../entities/skill.entity';
import { SkillAssessment, AssessmentStatus } from '../entities/skill-assessment.entity';
import { SkillLevel } from '../common/enums/skill.enum';
import { HelpDeskTicket } from '../entities/help-desk-ticket.entity';
import { SkillGapDto, DepartmentSkillsDto } from './dto/dashboard.dto';
import { SkillOverviewDto, TicketOverviewDto } from './dto/employee-dashboard.dto';
import { TeamSkillOverviewDto, UpdateSkillExpectationDto, TeamTicketOverviewDto } from './dto/manager-dashboard.dto';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(SkillAssessment)
    private assessmentRepository: Repository<SkillAssessment>,
    @InjectRepository(HelpDeskTicket)
    private ticketRepository: Repository<HelpDeskTicket>,
  ) {}

  async getDashboardMetrics() {
    const [totalEmployees, totalSkills, skillAssessments] = await Promise.all([
      this.userRepository.count(),
      this.skillRepository.count(),
      this.assessmentRepository.find(),
    ]);

    const meetingExpectations = skillAssessments.filter(
      assessment => assessment.currentLevel >= assessment.expectedLevel
    ).length;

    const percentageMeetingExpectations = 
      (meetingExpectations / skillAssessments.length) * 100 || 0;

    return {
      totalEmployees,
      totalSkills,
      percentageMeetingExpectations: Math.round(percentageMeetingExpectations),
    };
  }

  async getSkillGapAnalysis(): Promise<SkillGapDto[]> {
    const assessments = await this.assessmentRepository.find({
      relations: ['user', 'skill'],
    });

    return assessments.map(assessment => ({
      employeeName: assessment.user.employeeName,
      skillName: assessment.skill.name,
      currentLevel: this.getSkillLevelValue(assessment.currentLevel),
      expectedLevel: this.getSkillLevelValue(assessment.expectedLevel),
      gap: this.calculateSkillGap(assessment.currentLevel, assessment.expectedLevel),
    }));
  }

  async getDepartmentSkillsHeatmap(): Promise<DepartmentSkillsDto[]> {
    const users = await this.userRepository.find({
      relations: ['skillAssessments', 'skillAssessments.skill'],
    });

    const departmentSkills = new Map<string, Map<string, number[]>>();

    users.forEach(user => {
      if (!departmentSkills.has(user.department)) {
        departmentSkills.set(user.department, new Map());
      }

      user.skillAssessments.forEach(assessment => {
        const skillMap = departmentSkills.get(user.department);
        if (!skillMap.has(assessment.skill.name)) {
          skillMap.set(assessment.skill.name, []);
        }
        skillMap.get(assessment.skill.name).push(this.getSkillLevelValue(assessment.currentLevel));
      });
    });

    const result: DepartmentSkillsDto[] = [];

    departmentSkills.forEach((skillMap, department) => {
      skillMap.forEach((levels, skillName) => {
        const averageLevel = levels.reduce((a, b) => a + b, 0) / levels.length;
        result.push({
          department,
          skillName,
          averageLevel,
          expectedLevel: 3, // You might want to make this dynamic
        });
      });
    });

    return result;
  }

  private getSkillLevelValue(level: SkillLevel): number {
    const levelMap = {
      [SkillLevel.BEGINNER]: 1,
      [SkillLevel.INTERMEDIATE]: 2,
      [SkillLevel.ADVANCED]: 3
    };
    return levelMap[level];
  }

  private calculateSkillGap(currentLevel: SkillLevel, expectedLevel: SkillLevel): number {
    return this.getSkillLevelValue(expectedLevel) - this.getSkillLevelValue(currentLevel);
  }

  private calculateProgressPercentage(currentLevel: SkillLevel, expectedLevel: SkillLevel): number {
    const currentValue = this.getSkillLevelValue(currentLevel);
    const expectedValue = this.getSkillLevelValue(expectedLevel);
    return Math.round((currentValue / expectedValue) * 100);
  }

  async getEmployeeSkillOverview(userId: string): Promise<SkillOverviewDto[]> {
    const assessments = await this.assessmentRepository.find({
      where: { userId },
      relations: ['skill'],
    });

    return assessments.map(assessment => ({
      skillName: assessment.skill.name,
      currentLevel: assessment.currentLevel,
      expectedLevel: assessment.expectedLevel,
      certificationName: assessment.certificationName,
      certificationUrl: assessment.certificationUrl,
      progressPercentage: this.calculateProgressPercentage(
        assessment.currentLevel,
        assessment.expectedLevel
      ),
    }));
  }

  async getEmployeeTickets(userId: string): Promise<TicketOverviewDto[]> {
    const tickets = await this.ticketRepository.find({
      where: { submittedBy: { id: userId } },
      order: { createdAt: 'DESC' },
    });

    return tickets.map(ticket => ({
      id: ticket.id,
      queryType: ticket.queryType,
      description: ticket.description,
      status: ticket.status,
      createdAt: ticket.createdAt,
    }));
  }

  async getTeamSkillOverview(managerId: string): Promise<TeamSkillOverviewDto[]> {
    const teamMembers = await this.userRepository.find({
      where: [
        { reportingManager: { id: managerId } },
        { functionalManager: { id: managerId } }
      ],
      relations: ['skillAssessments', 'skillAssessments.skill'],
    });

    const skillCounts: { [skillName: string]: { count: number; skillId: string } } = {};

    for (const member of teamMembers) {
      for (const assessment of member.skillAssessments) {
          if (!skillCounts[assessment.skill.name]) {
            skillCounts[assessment.skill.name] = { count: 1, skillId: assessment.skill.id };
          } else {
            skillCounts[assessment.skill.name].count++;
          }
      }
    }

    const overview: any[] = Object.entries(skillCounts).map(([skillName, { count, skillId }]) => ({
      skillId,
      skillName,
      usersCount: count,
    }));

    return overview;
  }

  async updateSkillExpectation(dto: UpdateSkillExpectationDto, managerId: string): Promise<void> {
    // Verify manager has access to this employee
    const employee = await this.userRepository.findOne({
      where: [
        { id: dto.employeeId, reportingManager: { id: managerId } },
        { id: dto.employeeId, functionalManager: { id: managerId } }
      ]
    });

    if (!employee) {
      throw new BadRequestException('Unauthorized to update this employee\'s skills');
    }

    const assessment = await this.assessmentRepository.findOne({
      where: {
        user: { id: dto.employeeId },
        skill: { id: dto.skillId }
      }
    });

    if (!assessment) {
      throw new BadRequestException('Skill assessment not found');
    }

    // Convert number to SkillLevel enum
    const skillLevelValues = Object.values(SkillLevel);
    assessment.expectedLevel = skillLevelValues[dto.expectedLevel - 1] || SkillLevel.INTERMEDIATE;
    
    await this.assessmentRepository.save(assessment);
  }

  async getTeamTickets(managerId: string): Promise<TeamTicketOverviewDto[]> {
    const teamMembers = await this.userRepository.find({
      where: [
        { reportingManager: { id: managerId } },
        { functionalManager: { id: managerId } }
      ],
    });

    const teamMemberIds = teamMembers.map(member => member.id);

    const tickets = await this.ticketRepository.find({
      where: { submittedBy: { id: In(teamMemberIds) } },
      relations: ['submittedBy'],
      order: { createdAt: 'DESC' },
    });

    return tickets.map(ticket => ({
      ticketId: ticket.id,
      employeeName: ticket.submittedBy.employeeName,
      queryType: ticket.queryType,
      status: ticket.status,
      createdAt: ticket.createdAt,
      description: ticket.description,
    }));
  }

  async getAdminDashboard() {
    const [metrics, skillGaps, departmentHeatmap] = await Promise.all([
      this.getDashboardMetrics(),
      this.getSkillGapAnalysis(),
      this.getDepartmentSkillsHeatmap(),
    ]);

    return {
      metrics,
      skillGaps,
      departmentHeatmap,
    };
  }

  async getManagerDashboard(managerId: string) {
    const [teamSkills, teamTickets, departmentMetrics] = await Promise.all([
      this.getTeamSkillOverview(managerId),
      this.getTeamTickets(managerId),
      this.getDepartmentMetrics(managerId),
    ]);

    return {
      teamSkills,
      teamTickets,
      departmentMetrics,
    };
  }

  async getEmployeeDashboard(userId: string) {
    const [skills, tickets, progress] = await Promise.all([
      this.getEmployeeSkillOverview(userId),
      this.getEmployeeTickets(userId),
      this.getSkillProgress(userId),
    ]);

    return {
      skills,
      tickets,
      progress,
    };
  }

  private async getDepartmentMetrics(managerId: string) {
    const manager = await this.userRepository.findOne({
      where: { id: managerId },
      relations: ['skillAssessments'],
    });

    const teamMembers = await this.userRepository.find({
      where: [
        { reportingManager: { id: managerId } },
        { functionalManager: { id: managerId } }
      ],
      relations: ['skillAssessments'],
    });

    return {
      totalTeamMembers: teamMembers.length,
      skillsNeedingAttention: this.calculateSkillsNeedingAttention(teamMembers),
      departmentPerformance: this.calculateDepartmentPerformance(teamMembers),
    };
  }

  private async getSkillProgress(userId: string) {
    const assessments = await this.assessmentRepository.find({
      where: { user: { id: userId } },
      relations: ['skill'],
    });

    return {
      totalSkills: assessments.length,
      completedSkills: assessments.filter(a => 
        this.getSkillLevelValue(a.currentLevel) >= this.getSkillLevelValue(a.expectedLevel)
      ).length,
      inProgressSkills: assessments.filter(a => 
        this.getSkillLevelValue(a.currentLevel) < this.getSkillLevelValue(a.expectedLevel)
      ).length,
    };
  }

  private calculateSkillsNeedingAttention(teamMembers: User[]): number {
    let count = 0;
    teamMembers.forEach(member => {
      member.skillAssessments.forEach(assessment => {
        if (this.getSkillLevelValue(assessment.currentLevel) < 
            this.getSkillLevelValue(assessment.expectedLevel)) {
          count++;
        }
      });
    });
    return count;
  }

  private calculateDepartmentPerformance(teamMembers: User[]): number {
    let totalAssessments = 0;
    let meetingExpectations = 0;

    teamMembers.forEach(member => {
      member.skillAssessments.forEach(assessment => {
        totalAssessments++;
        if (this.getSkillLevelValue(assessment.currentLevel) >= 
            this.getSkillLevelValue(assessment.expectedLevel)) {
          meetingExpectations++;
        }
      });
    });

    return totalAssessments ? Math.round((meetingExpectations / totalAssessments) * 100) : 0;
  }

  async addNewSkill(
    userId: string,
    skillId: string,
    currentLevel: SkillLevel,
    certificationName?: string,
    certificationUrl?: string,
  ): Promise<SkillAssessment> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const skill = await this.skillRepository.findOne({
      where: { id: skillId }
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    // Create new assessment
    const assessment = new SkillAssessment();
    assessment.userId = user.id;
    assessment.skillId = skill.id;
    assessment.currentLevel = currentLevel;
    assessment.expectedLevel = SkillLevel.INTERMEDIATE;
    assessment.status = AssessmentStatus.PENDING;
    assessment.certificationName = certificationName;
    assessment.certificationUrl = certificationUrl;

    return this.assessmentRepository.save(assessment);
  }

  async updateSkillAssessment(
    assessmentId: string,
    currentLevel: SkillLevel,
    certificationName?: string,
    certificationUrl?: string,
  ): Promise<SkillAssessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id: assessmentId }
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    // Update only the allowed fields
    assessment.currentLevel = currentLevel;
    if (certificationName !== undefined) {
      assessment.certificationName = certificationName;
    }
    if (certificationUrl !== undefined) {
      assessment.certificationUrl = certificationUrl;
    }

    return this.assessmentRepository.save(assessment);
  }

  private isSkillLevelMet(currentLevel: SkillLevel, expectedLevel: SkillLevel): boolean {
    return this.getSkillLevelValue(currentLevel) >= this.getSkillLevelValue(expectedLevel);
  }

  async getTeamMembers(managerId: string): Promise<User[]> {
    const teamMembers = await this.userRepository.find({
      where: [
        { reportingManager: { id: managerId } },
        { functionalManager: { id: managerId } }
      ],
      relations: ['skillAssessments', 'skillAssessments.skill']
    });

    if (!teamMembers.length) {
      throw new NotFoundException('No team members found');
    }

    // Conjoin skill names for each user
    teamMembers.forEach(member => {
      member['skillNames'] = member.skillAssessments.map(assessment => assessment.skill.name).join(', ');
    });

    return teamMembers;
  }

  async getTeamUsersBySkill(managerId: string, skillId: string): Promise<User[]> {
    const teamMembers = await this.userRepository.find({
      where: [
        { reportingManager: { id: managerId } },
        { functionalManager: { id: managerId } }
      ],
      relations: ['skillAssessments', 'skillAssessments.skill']
    });

    return teamMembers.filter(member => 
      member.skillAssessments.some(assessment => assessment.skill.id === skillId)
    );
  }

  async getSkillDirectory(): Promise<{ 
    name: string; 
    category: string;
    expectedLevel: SkillLevel;
    employeeTrack: number;
  }[]> {
    const skills = await this.skillRepository.find({
      relations: ['assessments'],
      order: { name: 'ASC' }
    });

    return skills.map(skill => ({
      name: skill.name,
      category: skill.category,
      expectedLevel: skill.expectedLevel,
      employeeTrack: skill.assessments.length,
    }));
  }

  async getEmployeeMatrix(): Promise<{ 
    name: string; 
    role: string;
    department: string;
    skillAssessments: { 
      skill: { 
        name: string; 
      };
      currentLevel: SkillLevel;
      expectedLevel: SkillLevel;
    }[];
  }[]> {
    const employees = await this.userRepository.find({
      where: { role: 'employee' },
      relations: ['skillAssessments', 'skillAssessments.skill'],
      order: { employeeName: 'ASC' }
    });

    return employees.map(employee => ({
      name: employee.employeeName,
      role: employee.role,
      department: employee.department,
      skillAssessments: employee.skillAssessments.map(assessment => ({
        skill: {
          name: assessment.skill.name,
        },
        currentLevel: assessment.currentLevel,
        expectedLevel: assessment.expectedLevel,
      })),
    }));
  }
} 