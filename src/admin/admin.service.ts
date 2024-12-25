import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { CreateRoleDto, AssignRoleDto } from './dto/role.dto';
import { parse } from 'csv-parse';
import { Readable } from 'stream';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name }
    });

    if (existingRole) {
      throw new ConflictException('Role already exists');
    }

    const role = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(role);
  }

  async assignRole(assignRoleDto: AssignRoleDto): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { id: assignRoleDto.roleId }
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const users = await this.userRepository.findBy({
      id: In(assignRoleDto.userIds)
    });
    
    if (users.length !== assignRoleDto.userIds.length) {
      throw new NotFoundException('Some users not found');
    }

    await Promise.all(
      users.map(user => {
        user.roles = [...(user.roles || []), role];
        return this.userRepository.save(user);
      })
    );
  }

  async bulkUploadRoles(file: Buffer): Promise<void> {
    const records = await this.parseCsv(file);
    for (const record of records) {
      const user = await this.userRepository.findOne({
        where: { employeeCode: record.employeeCode }
      });
      console.log('user', user);
      if (!user) continue;

      const role = await this.roleRepository.findOne({
        where: { name: record.roleName }
      });

      if (!role) continue;

      user.roles = [...(user.roles || []), role];
      console.log(user);
      await this.userRepository.save(user);
    }
  }

  private async parseCsv(file: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const records = [];
      const parser = parse({
        columns: true,
        skip_empty_lines: true
      });
      parser.on('readable', function() {
        let record;
        while (record = parser.read()) {
          records.push(record);
        }
      });

      parser.on('error', function(err) {
        reject(err);
      });

      parser.on('end', function() {
        resolve(records);
      });

      const stream = new Readable();
      stream.push(file);
      stream.push(null);
      stream.pipe(parser);
    });
  }

  async updateUserHierarchy(userId: string, managerId: string, type: 'reporting' | 'functional'): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const manager = await this.userRepository.findOne({
      where: { id: managerId }
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    if (type === 'reporting') {
      user.reportingManager = manager;
    } else {
      user.functionalManager = manager;
    }

    return this.userRepository.save(user);
  }
} 