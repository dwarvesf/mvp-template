'use client';

import * as React from 'react';
import {
  BarChart3,
  BookOpen,
  FileText,
  Home,
  Settings,
  User,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Static data - session data will be handled in child components
  const data = {
    user: {
      name: 'User',
      email: '',
      avatar: '/avatars/default.jpg',
    },
    navMain: [
      {
        title: 'Dashboard',
        url: '/',
        icon: Home,
        isActive: true,
        items: [
          {
            title: 'Overview',
            url: '/',
          },
          {
            title: 'Analytics',
            url: '/analytics',
          },
          {
            title: 'Reports',
            url: '/reports',
          },
        ],
      },
      {
        title: 'Teams',
        url: '/teams',
        icon: User,
        items: [
          {
            title: 'Manage Teams',
            url: '/teams',
          },
          {
            title: 'Members',
            url: '/teams/members',
          },
          {
            title: 'Invitations',
            url: '/teams/invitations',
          },
        ],
      },
      {
        title: 'Profile',
        url: '/profile',
        icon: User,
        items: [
          {
            title: 'Account',
            url: '/profile',
          },
          {
            title: 'Security',
            url: '/profile/security',
          },
          {
            title: 'Preferences',
            url: '/profile/preferences',
          },
        ],
      },
      {
        title: 'Documentation',
        url: 'http://localhost:4000/docs',
        icon: BookOpen,
        items: [
          {
            title: 'API Reference',
            url: 'http://localhost:4000/docs',
          },
          {
            title: 'Getting Started',
            url: '#',
          },
          {
            title: 'Guides',
            url: '#',
          },
        ],
      },
      {
        title: 'Settings',
        url: '/settings',
        icon: Settings,
        items: [
          {
            title: 'General',
            url: '/settings',
          },
          {
            title: 'Notifications',
            url: '/settings/notifications',
          },
          {
            title: 'Integrations',
            url: '/settings/integrations',
          },
        ],
      },
    ],
    projects: [
      {
        name: 'API Integration',
        url: '#',
        icon: BarChart3,
      },
      {
        name: 'User Management',
        url: '#',
        icon: User,
      },
      {
        name: 'Documentation',
        url: '#',
        icon: FileText,
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}