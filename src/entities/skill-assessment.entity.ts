import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Skill } from './skill.entity';
import { SkillLevel } from '../common/enums/skill.enum';

export enum AssessmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

@Entity('skill_assessments')
export class SkillAssessment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.skillAssessments)
  user: User;

  @Column({ name: 'userId' })
  userId: string;

  @ManyToOne(() => Skill)
  skill: Skill;

  @Column({ name: 'skillId' })
  skillId: string;

  @Column({
    type: 'enum',
    enum: SkillLevel,
    default: SkillLevel.BEGINNER
  })
  currentLevel: SkillLevel;

  @Column({
    type: 'enum',
    enum: SkillLevel,
    default: SkillLevel.INTERMEDIATE
  })
  expectedLevel: SkillLevel;

  @Column({
    type: 'enum',
    enum: AssessmentStatus,
    default: AssessmentStatus.PENDING
  })
  status: AssessmentStatus;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ nullable: true })
  certificationName: string;

  @Column({ nullable: true })
  certificationUrl: string;

  @CreateDateColumn()
  assessmentDate: Date;
} 