import { Injectable } from '@nestjs/common';
import { NavigationItemDto, FooterLinkDto } from '../dto/navigation.dto';

@Injectable()
export class NavigationService {
  getHeaderNavigation(userRole: string): NavigationItemDto[] {
    const baseNavigation: NavigationItemDto[] = [
      {
        label: 'Home',
        path: '/dashboard',
        icon: 'home',
      },
      {
        label: 'Profile',
        path: '/profile',
        icon: 'user',
      },
      {
        label: 'Notifications',
        path: '/notifications',
        icon: 'bell',
      },
      {
        label: 'Help Desk',
        path: '/helpdesk',
        icon: 'support',
      },
    ];

    // Add role-specific navigation items
    if (userRole === 'admin') {
      baseNavigation.push(
        {
          label: 'Settings',
          path: '/settings',
          icon: 'settings',
          permission: 'admin',
        },
        {
          label: 'User Management',
          path: '/admin/users',
          icon: 'users',
          permission: 'admin',
        }
      );
    }

    if (userRole === 'manager') {
      baseNavigation.push({
        label: 'Team',
        path: '/team',
        icon: 'users',
        permission: 'manager',
      });
    }

    return baseNavigation;
  }

  getFooterLinks(): FooterLinkDto[] {
    return [
      {
        label: 'Help',
        path: '/help',
        category: 'support',
      },
      {
        label: 'FAQs',
        path: '/faqs',
        category: 'support',
      },
      {
        label: 'Contact Support',
        path: '/contact',
        category: 'support',
      },
      {
        label: 'Privacy Policy',
        path: '/privacy',
        category: 'legal',
      },
      {
        label: 'Terms of Service',
        path: '/terms',
        category: 'legal',
      },
    ];
  }

  getActionButtons(context: string): string[] {
    const commonButtons = ['Save', 'Cancel'];
    
    switch (context) {
      case 'form':
        return [...commonButtons, 'Submit'];
      case 'view':
        return ['Edit', ...commonButtons];
      case 'list':
        return ['Add New', 'Edit', 'Delete'];
      default:
        return commonButtons;
    }
  }
} 