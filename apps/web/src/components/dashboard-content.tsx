'use client';

import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Mail } from 'lucide-react';

export function DashboardContent() {
  const { data: session } = useSession();

  const stats = [
    {
      title: 'Account Status',
      value: 'Active',
      description: 'Your account is verified and ready',
      icon: User,
      color: 'text-green-600',
    },
    {
      title: 'Member Since',
      value: new Date().toLocaleDateString(),
      description: 'Account creation date',
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Last Login',
      value: 'Now',
      description: 'Your current session',
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      title: 'Email',
      value: session?.user?.email || 'Not available',
      description: 'Your registered email',
      icon: Mail,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session?.user?.name || 'User'}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold truncate">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Update Profile</span>
              <Badge variant="outline">Available</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Security Settings</span>
              <Badge variant="outline">Available</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">API Documentation</span>
              <Badge variant="outline">View</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Service</span>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Email Service</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Resources to help you get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              • Explore the API documentation
            </div>
            <div className="text-sm">
              • Update your profile settings
            </div>
            <div className="text-sm">
              • Configure security preferences
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}