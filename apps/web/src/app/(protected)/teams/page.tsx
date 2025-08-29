'use client';

import { useState } from 'react';
import { useTeams } from '@/contexts/teams-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Settings, Trash2, Users, Crown, Shield, Loader2 } from 'lucide-react';
import { useOrganizationsControllerCreateOrganization, useOrganizationsControllerDeleteOrganization, useOrganizationsControllerUpdateOrganization } from '@mvp-template/api-client/src/generated';
import { toast } from 'sonner';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function TeamsPage() {
  const { teams, refetch, isLoading } = useTeams();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [teamName, setTeamName] = useState('');
  const [teamSlug, setTeamSlug] = useState('');

  const createMutation = useOrganizationsControllerCreateOrganization();
  const updateMutation = useOrganizationsControllerUpdateOrganization();
  const deleteMutation = useOrganizationsControllerDeleteOrganization();

  const handleCreateTeam = async () => {
    if (!teamName || !teamSlug) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createMutation.mutateAsync({
        data: {
          name: teamName,
          slug: teamSlug,
        },
      });
      toast.success('Team created successfully');
      setCreateDialogOpen(false);
      setTeamName('');
      setTeamSlug('');
      refetch();
    } catch (error) {
      toast.error('Failed to create team');
    }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam || !teamName) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        orgId: editingTeam.id,
        data: {
          name: teamName,
        },
      });
      toast.success('Team updated successfully');
      setEditingTeam(null);
      setTeamName('');
      refetch();
    } catch (error) {
      toast.error('Failed to update team');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteMutation.mutateAsync({
        orgId: teamId,
      });
      toast.success('Team deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete team');
    }
  };

  const getRoleIcon = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('owner')) return Crown;
    if (roleLower.includes('admin')) return Shield;
    return Users;
  };

  const getRoleBadgeVariant = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('owner')) return 'default';
    if (roleLower.includes('admin')) return 'secondary';
    return 'outline';
  };

  const TeamSkeleton = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teams</h1>
          <p className="text-muted-foreground">Manage your teams and organizations</p>
        </div>
        <Link href="/teams/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Team
          </Button>
        </Link>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <span />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to collaborate with others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  placeholder="Acme Corp"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Team Slug</Label>
                <Input
                  id="slug"
                  placeholder="acme-corp"
                  value={teamSlug}
                  onChange={(e) => setTeamSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                />
                <p className="text-sm text-muted-foreground">
                  This will be used in URLs and must be unique
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <TeamSkeleton />
            <TeamSkeleton />
            <TeamSkeleton />
          </>
        ) : teams.length > 0 ? (
          teams.map((team) => {
          const RoleIcon = getRoleIcon(team.role);
          return (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  <Badge variant={getRoleBadgeVariant(team.role) as any}>
                    <RoleIcon className="mr-1 h-3 w-3" />
                    {team.role}
                  </Badge>
                </div>
                <CardDescription>
                  {team.memberCount ? `${team.memberCount} members` : 'No members yet'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Link href={`/teams/${team.id}`}>
                    <Button variant="outline" className="w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Team
                    </Button>
                  </Link>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2">
                    <Dialog
                      open={editingTeam?.id === team.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setEditingTeam(team);
                          setTeamName(team.name);
                        } else {
                          setEditingTeam(null);
                          setTeamName('');
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Team</DialogTitle>
                          <DialogDescription>
                            Update team settings
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Team Name</Label>
                            <Input
                              id="edit-name"
                              value={teamName}
                              onChange={(e) => setTeamName(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingTeam(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleUpdateTeam} disabled={updateMutation.isPending}>
                            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {team.role.toLowerCase().includes('owner') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Team</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{team.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteTeam(team.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Team
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }))
        : (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No teams yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first team to start collaborating
              </p>
              <Link href="/teams/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Team
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

    </div>
  );
}