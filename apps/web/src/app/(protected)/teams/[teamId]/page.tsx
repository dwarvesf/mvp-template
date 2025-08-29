'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTeams } from '@/contexts/teams-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  Shield, 
  Crown, 
  Trash2, 
  Loader2, 
  Mail, 
  UserPlus,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { useMembersControllerGetMembers, useMembersControllerRemoveMember, useInvitationsControllerCreateInvitation } from '@mvp-template/api-client/src/generated';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function TeamManagementPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.teamId as string;
  const { teams, updateTeam, deleteTeam } = useTeams();
  const [teamName, setTeamName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const team = teams.find(t => t.id === teamId);

  const { data: membersData, refetch: refetchMembers, isLoading } = useMembersControllerGetMembers(
    teamId,
    { query: { enabled: !!teamId } }
  );

  const removeMemberMutation = useMembersControllerRemoveMember();
  const inviteMemberMutation = useInvitationsControllerCreateInvitation();

  useEffect(() => {
    if (team) {
      setTeamName(team.name);
    }
  }, [team]);

  if (!team) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Team not found</h2>
          <p className="text-muted-foreground mt-2">The team you're looking for doesn't exist.</p>
          <Link href="/teams">
            <Button className="mt-4">Back to Teams</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = team.role.toLowerCase().includes('owner');
  const canManageTeam = isOwner || team.role.toLowerCase().includes('admin');

  const handleUpdateTeam = async () => {
    if (!teamName || teamName === team.name) return;

    setIsUpdating(true);
    try {
      await updateTeam(teamId, { name: teamName });
      toast.success('Team updated successfully');
    } catch {
      toast.error('Failed to update team');
      setTeamName(team.name);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(teamId);
      toast.success('Team deleted successfully');
      router.push('/teams');
    } catch {
      toast.error('Failed to delete team');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMemberMutation.mutateAsync({
        orgId: teamId,
        userId: memberId,
      });
      toast.success('Member removed successfully');
      refetchMembers();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setIsInviting(true);
    try {
      await inviteMemberMutation.mutateAsync({
        orgId: teamId,
        data: {
          email: inviteEmail,
          roleId: inviteRole === 'admin' ? 'admin-role-id' : 'member-role-id', // TODO: Get actual role IDs
        },
      });
      toast.success('Invitation sent successfully');
      setInviteEmail('');
      refetchMembers();
    } catch {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('owner')) return Crown;
    if (roleLower.includes('admin')) return Shield;
    return Users;
  };

  const membersResponse = membersData?.data as unknown as { members?: unknown[] } | null | undefined;
  const members = membersResponse?.members || [];

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email[0]?.toUpperCase() ?? 'U' : 'U';
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Link href="/teams">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <div className="flex flex-1 flex-col space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">{team.name}</h2>
            <p className="text-sm text-muted-foreground">
              Manage your team settings and members
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team information</CardTitle>
                <CardDescription>
                  Update your team's basic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleUpdateTeam(); }}>
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="team-name">Team name</Label>
                      <div className="flex gap-2">
                        <Input
                          id="team-name"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          disabled={!canManageTeam || isUpdating}
                          className="max-w-md"
                        />
                        {canManageTeam && (
                          <Button
                            type="submit"
                            disabled={isUpdating || teamName === team.name}
                          >
                            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Team URL</Label>
                      <div className="flex rounded-md shadow-sm max-w-md">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                          app.com/teams/
                        </span>
                        <Input value={team.slug} disabled className="rounded-l-none" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        URL slugs cannot be changed after creation
                      </p>
                    </div>

                    <div className="grid gap-2">
                      <Label>Your role</Label>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const Icon = getRoleIcon(team.role);
                          return (
                            <Badge variant="secondary" className="gap-1">
                              <Icon className="h-3 w-3" />
                              {team.role}
                            </Badge>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {isOwner && !team.isDefault && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger zone</CardTitle>
                  <CardDescription>
                    Irreversible and destructive actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete team
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the team
                          "{team.name}" and remove all associated data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteTeam}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete team
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            {canManageTeam && (
              <Card>
                <CardHeader>
                  <CardTitle>Invite members</CardTitle>
                  <CardDescription>
                    Add new members to your team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleInviteMember}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <div className="flex gap-2">
                          <Input
                            id="email"
                            type="email"
                            placeholder="colleague@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            className="flex-1"
                          />
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="submit" disabled={isInviting || !inviteEmail}>
                            {isInviting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Mail className="mr-2 h-4 w-4" />
                                Invite
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Team members</CardTitle>
                <CardDescription>
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isLoading ? (
                    <>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-48" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : members.length > 0 ? (
                    members.map((member) => {
                      const memberData = member as { 
                        id: string;
                        userId: string;
                        user?: { 
                          email?: string; 
                          name?: string; 
                          image?: string; 
                        };
                        role?: { name?: string };
                      };
                      const MemberIcon = getRoleIcon(memberData.role?.name || 'Member');
                      const isSelf = memberData.user?.email === team.role;
                      
                      return (
                        <div key={memberData.id} className="flex items-center justify-between rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={memberData.user?.image} />
                              <AvatarFallback>
                                {getInitials(memberData.user?.name, memberData.user?.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {memberData.user?.name || memberData.user?.email}
                                {isSelf && <span className="text-muted-foreground ml-2 text-sm">(You)</span>}
                              </p>
                              <p className="text-sm text-muted-foreground">{memberData.user?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="gap-1">
                              <MemberIcon className="h-3 w-3" />
                              {memberData.role?.name || 'Member'}
                            </Badge>
                            {canManageTeam && !isSelf && memberData.role?.name !== 'Owner' && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveMember(memberData.userId)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove member
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No members yet. Invite someone to get started!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}