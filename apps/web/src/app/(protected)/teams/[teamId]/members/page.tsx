'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { useTeams } from '@/contexts/teams-context';

export default function TeamMembersPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { teams } = useTeams();
  const team = teams.find(t => t.id === teamId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{team?.name} Members</h1>
          <p className="text-muted-foreground">Manage team members and invitations</p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Member management coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Member Management Coming Soon</h3>
            <p className="text-muted-foreground text-center">
              The ability to manage team members and send invitations will be available in the next update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}