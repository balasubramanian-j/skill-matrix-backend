import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { HelpDeskTicket, TicketStatus } from '../entities/help-desk-ticket.entity';
import { User } from '../entities/user.entity';
import { CreateTicketDto, UpdateTicketDto, TicketFilterDto } from './dto/helpdesk.dto';

@Injectable()
export class HelpdeskService {
  constructor(
    @InjectRepository(HelpDeskTicket)
    private ticketRepository: Repository<HelpDeskTicket>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async generateTicketId(): Promise<string> {
    const count = await this.ticketRepository.count();
    return `SMH${(count + 1).toString().padStart(2, '0')}`;
  }

  async createTicket(userId: string, createTicketDto: CreateTicketDto): Promise<HelpDeskTicket> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const ticketId = await this.generateTicketId();
    
    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      ticketId,
      submittedBy: user,
      status: TicketStatus.OPEN,
    });

    return this.ticketRepository.save(ticket);
  }

  async getTickets(filterDto: TicketFilterDto, userId?: string): Promise<HelpDeskTicket[]> {
    const { search, status, queryType } = filterDto;
    const query = this.ticketRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.submittedBy', 'submittedBy')
      .leftJoinAndSelect('ticket.assignedAdmin', 'assignedAdmin');

    if (userId) {
      query.where('submittedBy.id = :userId', { userId });
    }

    if (search) {
      query.andWhere(
        '(ticket.ticketId LIKE :search OR ticket.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      query.andWhere('ticket.status = :status', { status });
    }

    if (queryType) {
      query.andWhere('ticket.queryType = :queryType', { queryType });
    }

    query.orderBy('ticket.createdAt', 'DESC');

    return query.getMany();
  }

  async getTicketById(id: string): Promise<HelpDeskTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['submittedBy', 'assignedAdmin'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async updateTicket(id: string, updateTicketDto: UpdateTicketDto, adminId: string): Promise<HelpDeskTicket> {
    const ticket = await this.getTicketById(id);
    
    if (updateTicketDto.assignedAdminId) {
      const admin = await this.userRepository.findOne({
        where: { id: updateTicketDto.assignedAdminId, role: 'admin' }
      });
      
      if (!admin) {
        throw new BadRequestException('Invalid admin ID');
      }
      ticket.assignedAdmin = admin;
    }

    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
  }

  async getTicketStats() {
    const stats = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.status')
      .getRawMany();

    return stats.reduce((acc, curr) => {
      acc[curr.status] = parseInt(curr.count);
      return acc;
    }, {});
  }
} 