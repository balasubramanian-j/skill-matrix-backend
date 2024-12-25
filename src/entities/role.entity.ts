import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum Permission {
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  VIEW_USER = 'view_user',
  MANAGE_ROLES = 'manage_roles',
  MANAGE_SKILLS = 'manage_skills',
  VIEW_REPORTS = 'view_reports'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'simple-array' })
  permissions: Permission[];

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => User, user => user.roles)
  users: User[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 