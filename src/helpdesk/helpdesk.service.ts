import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { HelpDeskTicket, TicketStatus } from '../entities/help-desk-ticket.entity';
import { CreateTicketDto, UpdateTicketDto, TicketFilterDto } from './dto/helpdesk.dto';
import { User } from '../entities/user.entity';

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


  getAllTickets(filterDto: TicketFilterDto) {
    const query = this.ticketRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.submittedBy', 'user')
      .leftJoinAndSelect('ticket.assignedAdmin', 'admin');

    if (filterDto.status) {
      query.andWhere('ticket.status = :status', { status: filterDto.status });
    }

    if (filterDto.queryType) {
      query.andWhere('ticket.queryType = :queryType', { queryType: filterDto.queryType });
    }

    if (filterDto.search) {
      query.andWhere(
        '(ticket.description LIKE :search OR ticket.ticketId LIKE :search)',
        { search: `%${filterDto.search}%` }
      );
    }

    return query.orderBy('ticket.createdAt', 'DESC').getMany();
  }

  async getUserTickets(userId: string, filterDto: TicketFilterDto): Promise<HelpDeskTicket[]> {
    const query = this.ticketRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.submittedBy', 'submittedBy')
      .leftJoinAndSelect('ticket.assignedAdmin', 'assignedAdmin')
      .where('ticket.submittedById = :userId', { userId });

    if (filterDto.status) {
      query.andWhere('ticket.status = :status', { status: filterDto.status });
    }

    if (filterDto.queryType) {
      query.andWhere('ticket.queryType = :queryType', { queryType: filterDto.queryType });
    }

    if (filterDto.search) {
      query.andWhere(
        '(ticket.description LIKE :search OR ticket.ticketId LIKE :search)',
        { search: `%${filterDto.search}%` }
      );
    }

    return query.orderBy('ticket.createdAt', 'DESC').getMany();
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

  async getUserTicketById(userId: string, id: string): Promise<HelpDeskTicket> {
    const ticket = await this.ticketRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.submittedBy', 'submittedBy')
      .leftJoinAndSelect('ticket.assignedAdmin', 'assignedAdmin')
      .where('ticket.id = :id ', { id })
      .getOne();

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async updateTicket(
    id: string,
    updateTicketDto: UpdateTicketDto,
    adminId: string,
  ): Promise<HelpDeskTicket> {
    const ticket = await this.getTicketById(id);
    const admin = await this.userRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (updateTicketDto.status) {
      ticket.status = updateTicketDto.status;
    }

    if (updateTicketDto.adminNotes) {
      ticket.adminNotes = updateTicketDto.adminNotes;
    }

    ticket.assignedAdmin = admin;
    return this.ticketRepository.save(ticket);
  }

  async getTicketStats() {
    const stats = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('ticket.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('ticket.status')
      .getRawMany();

    const totalTickets = await this.ticketRepository.count();
    const openTickets = await this.ticketRepository.count({ where: { status: TicketStatus.OPEN } });
    const resolvedTickets = await this.ticketRepository.count({ where: { status: TicketStatus.RESOLVED } });

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      resolutionRate: totalTickets ? (resolvedTickets / totalTickets) * 100 : 0,
      statusDistribution: stats.reduce((acc, curr) => {
        acc[curr.status] = parseInt(curr.count);
        return acc;
      }, {}),
    };
  }
} 