'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import {
  BarChart3,
  BookOpen,
  FileText,
  GalleryVerticalEnd,
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
  const { data: session } = useSession();

  const data = {
    user: {
      name: session?.user?.name || session?.user?.email?.split('@')[0] || 'User',
      email: session?.user?.email || '',
      avatar: session?.user?.image || '/avatars/default.jpg',
    },
    teams: [
      {
        name: 'MVP Template',
        logo: GalleryVerticalEnd,
        plan: 'Development',
      },
    ],
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
        url: 'http:/localhost:4000/docs',
        icon: BookOpen,
        items: [
          {
            title: 'API Reference',
            url: 'http:/localhost:4000/docs',
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
        <TeamSwitcher teams={data.teams} />
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
