import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { SkillAssessment } from './skill-assessment.entity';
import { HelpDeskTicket } from './help-desk-ticket.entity';
import { Role } from './role.entity';
import { Notification } from './notification.entity';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
}

export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
  OTHER = 'O',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  employeeCode: string;

  @Column()
  password: string;

  @Column()
  employeeName: string;

  @Column()
  businessUnit: string;

  @Column()
  department: string;

  @ManyToOne(() => User, { nullable: true })
  reportingManager: User;

  @ManyToOne(() => User, { nullable: true })
  functionalManager: User;

  @Column({ unique: true })
  officialEmail: string;

  @Column()
  designation: string;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @Column()
  role: string;

  @Column({ type: 'date' })
  dateOfJoining: Date;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => SkillAssessment, assessment => assessment.user)
  skillAssessments: SkillAssessment[];

  @OneToMany(() => HelpDeskTicket, ticket => ticket.submittedBy)
  helpDeskTickets: HelpDeskTicket[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  resetOtp: string;

  @Column({ type: 'timestamp', nullable: true })
  resetOtpExpiry: Date;

  @ManyToMany(() => Role, role => role.users, {
    eager: true,
  })
  @JoinTable({
    name: 'user_roles',
    joinColumn: {
      name: 'userId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];

  @Column('json', { nullable: true })
  movementHistory: {
    date: Date;
    previousManager: string;
    previousDepartment: string;
    newManager: string;
    newDepartment: string;
  }[];

  @Column('json', { nullable: true })
  customFields: { [key: string]: any };

  @Column('json', { nullable: true })
  deactivationHistory: {
    date: Date;
    reason: string;
    notes?: string;
    deactivatedBy: string;
  }[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];
} 