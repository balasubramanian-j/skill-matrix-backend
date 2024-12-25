import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { CustomField } from '../entities/custom-field.entity';
import { CreateFieldDto, UpdateFieldDto, EmployeeMovementDto, BulkMovementDto } from './dto/settings.dto';
import { DeactivateEmployeeDto, BulkDeactivateDto, SearchEmployeeDto } from './dto/deactivation.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(CustomField)
    private fieldRepository: Repository<CustomField>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createField(createFieldDto: CreateFieldDto): Promise<CustomField> {
    const existingField = await this.fieldRepository.findOne({
      where: { name: createFieldDto.name }
    });

    if (existingField) {
      throw new BadRequestException('Field name already exists');
    }

    const field = this.fieldRepository.create(createFieldDto);
    return this.fieldRepository.save(field);
  }

  async updateField(id: string, updateFieldDto: UpdateFieldDto): Promise<CustomField> {
    const field = await this.fieldRepository.findOne({
      where: { id }
    });

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    const existingField = await this.fieldRepository.findOne({
      where: { name: updateFieldDto.newName }
    });

    if (existingField && existingField.id !== id) {
      throw new BadRequestException('Field name already exists');
    }

    field.name = updateFieldDto.newName;
    return this.fieldRepository.save(field);
  }

  async moveEmployee(movementDto: EmployeeMovementDto): Promise<User> {
    const employee = await this.userRepository.findOne({
      where: { id: movementDto.employeeId }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (movementDto.newManagerId) {
      const manager = await this.userRepository.findOne({
        where: { id: movementDto.newManagerId }
      });

      if (!manager) {
        throw new NotFoundException('Manager not found');
      }

      employee.reportingManager = manager;
    }

    if (movementDto.newDepartment) {
      employee.department = movementDto.newDepartment;
    }

    // Store movement history
    employee.movementHistory = employee.movementHistory || [];
    employee.movementHistory.push({
      date: movementDto.effectiveDate,
      previousManager: employee.reportingManager?.id,
      previousDepartment: employee.department,
      newManager: movementDto.newManagerId,
      newDepartment: movementDto.newDepartment,
    });

    return this.userRepository.save(employee);
  }

  async bulkMoveEmployees(bulkMovementDto: BulkMovementDto): Promise<User[]> {
    const employees = await this.userRepository.findBy({
      id: In(bulkMovementDto.employeeIds)
    });

    if (employees.length !== bulkMovementDto.employeeIds.length) {
      throw new NotFoundException('Some employees not found');
    }

    let manager = null;
    if (bulkMovementDto.newManagerId) {
      manager = await this.userRepository.findOne({
        where: { id: bulkMovementDto.newManagerId }
      });

      if (!manager) {
        throw new NotFoundException('Manager not found');
      }
    }

    const updatedEmployees = employees.map(employee => {
      if (manager) {
        employee.reportingManager = manager;
      }

      if (bulkMovementDto.newDepartment) {
        employee.department = bulkMovementDto.newDepartment;
      }

      // Store movement history
      employee.movementHistory = employee.movementHistory || [];
      employee.movementHistory.push({
        date: bulkMovementDto.effectiveDate,
        previousManager: employee.reportingManager?.id,
        previousDepartment: employee.department,
        newManager: bulkMovementDto.newManagerId,
        newDepartment: bulkMovementDto.newDepartment,
      });

      return employee;
    });

    return this.userRepository.save(updatedEmployees);
  }

  async getCustomFields(): Promise<CustomField[]> {
    return this.fieldRepository.find();
  }

  async getFieldById(id: string): Promise<CustomField> {
    const field = await this.fieldRepository.findOne({
      where: { id }
    });

    if (!field) {
      throw new NotFoundException('Field not found');
    }

    return field;
  }

  async deleteField(id: string): Promise<void> {
    const result = await this.fieldRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Field not found');
    }
  }

  async searchEmployees(searchDto: SearchEmployeeDto): Promise<User[]> {
    const query = this.userRepository.createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true });

    if (searchDto.searchTerm) {
      query.andWhere(
        '(user.employeeName LIKE :search OR user.employeeCode LIKE :search)',
        { search: `%${searchDto.searchTerm}%` }
      );
    }

    if (searchDto.department) {
      query.andWhere('user.department = :department', { department: searchDto.department });
    }

    return query.getMany();
  }

  async deactivateEmployee(deactivateDto: DeactivateEmployeeDto): Promise<User> {
    const employee = await this.userRepository.findOne({
      where: { id: deactivateDto.employeeId }
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    if (!employee.isActive) {
      throw new BadRequestException('Employee is already inactive');
    }

    // Store deactivation history
    const deactivationRecord = {
      date: deactivateDto.effectiveDate,
      reason: deactivateDto.reason,
      notes: deactivateDto.notes,
      deactivatedBy: employee.id, // You might want to pass the admin's ID who performed this action
    };

    employee.isActive = false;
    employee.deactivationHistory = employee.deactivationHistory || [];
    employee.deactivationHistory.push(deactivationRecord);

    const updatedEmployee = await this.userRepository.save(employee);

    // Emit event for notifications
    this.eventEmitter.emit('employee.deactivated', {
      employee: updatedEmployee,
      deactivationDetails: deactivationRecord,
    });

    return updatedEmployee;
  }

  async bulkDeactivateEmployees(bulkDeactivateDto: BulkDeactivateDto): Promise<User[]> {
    const employees = await this.userRepository.findBy({
      id: In(bulkDeactivateDto.employeeIds)
    });

    if (employees.length !== bulkDeactivateDto.employeeIds.length) {
      throw new NotFoundException('Some employees not found');
    }

    const deactivationRecord = {
      date: bulkDeactivateDto.effectiveDate,
      reason: bulkDeactivateDto.reason,
      notes: bulkDeactivateDto.notes,
      deactivatedBy: 'admin', // Pass the admin's ID
    };

    const updatedEmployees = employees.map(employee => {
      if (!employee.isActive) {
        throw new BadRequestException(`Employee ${employee.employeeName} is already inactive`);
      }

      employee.isActive = false;
      employee.deactivationHistory = employee.deactivationHistory || [];
      employee.deactivationHistory.push(deactivationRecord);

      return employee;
    });

    const savedEmployees = await this.userRepository.save(updatedEmployees);

    // Emit event for notifications
    this.eventEmitter.emit('employees.bulk.deactivated', {
      employees: savedEmployees,
      deactivationDetails: deactivationRecord,
    });

    return savedEmployees;
  }

  async getInactiveEmployees(): Promise<User[]> {
    return this.userRepository.find({
      where: { isActive: false },
      order: { updatedAt: 'DESC' },
    });
  }
} 