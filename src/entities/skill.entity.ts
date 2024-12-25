import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { SkillAssessment } from './skill-assessment.entity';
import { SkillLevel } from '../common/enums/skill.enum';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => SkillAssessment, assessment => assessment.skill)
  assessments: SkillAssessment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: SkillLevel,
    default: SkillLevel.INTERMEDIATE
  })
  expectedLevel: SkillLevel;
} 