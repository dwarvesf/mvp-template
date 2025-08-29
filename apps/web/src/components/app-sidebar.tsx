'use client';

import * as React from 'react';
import {
  BookOpen,
  Home,
  Settings,
  User,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
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
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Home className="size-4" />
          </div>
          <span className="font-semibold">MVP Template</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}