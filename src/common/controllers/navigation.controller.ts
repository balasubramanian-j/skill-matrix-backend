import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NavigationService } from '../services/navigation.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetUser } from '../../auth/get-user.decorator';

@ApiTags('Common')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('common')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Get('navigation')
  @ApiOperation({ summary: 'Get navigation items based on user role' })
  getNavigation(@GetUser('role') userRole: string) {
    return this.navigationService.getHeaderNavigation(userRole);
  }

  @Get('footer')
  @ApiOperation({ summary: 'Get footer links' })
  getFooterLinks() {
    return this.navigationService.getFooterLinks();
  }

  @Get('actions')
  @ApiOperation({ summary: 'Get action buttons for context' })
  getActionButtons(@GetUser('context') context: string) {
    return this.navigationService.getActionButtons(context);
  }
} 