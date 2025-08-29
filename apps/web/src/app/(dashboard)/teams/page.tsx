'use client';

import { useState } from 'react';
import { useTeams } from '@/contexts/teams-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Building2, Crown, Shield, Users, Trash2, Edit, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TeamsPage() {
  const { teams, currentTeam, setCurrentTeam, createTeam, updateTeam, deleteTeam, isLoading } = useTeams();
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamSlug, setNewTeamSlug] = useState('');
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const getRoleIcon = (role: string) => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('owner')) return Crown;
    if (roleLower.includes('admin')) return Shield;
    return Users;
  };

  const handleCreateTeam = async () => {
    if (!newTeamName) return;
    await createTeam(newTeamName, newTeamSlug || undefined);
    setNewTeamName('');
    setNewTeamSlug('');
    setIsCreateOpen(false);
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;
    await updateTeam(editingTeam.id, { name: editingTeam.name });
    setEditingTeam(null);
    setIsEditOpen(false);
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (confirm('Are you sure you want to delete this team?')) {
      await deleteTeam(teamId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage your teams and organizations</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team to collaborate with others
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug (optional)</Label>
                <Input
                  id="slug"
                  value={newTeamSlug}
                  onChange={(e) => setNewTeamSlug(e.target.value)}
                  placeholder="team-slug"
                  pattern="[a-z0-9-]+"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Only lowercase letters, numbers, and hyphens
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTeam}>Create Team</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => {
          const RoleIcon = getRoleIcon(team.role);
          const isOwner = team.role.toLowerCase().includes('owner');
          const canEdit = isOwner || team.role.toLowerCase().includes('admin');
          
          return (
            <Card 
              key={team.id}
              className={currentTeam?.id === team.id ? 'ring-2 ring-primary' : ''}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {team.name}
                        {team.isDefault && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Default
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <RoleIcon className="h-3 w-3" />
                        {team.role}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>{formatDistanceToNow(new Date(team.createdAt), { addSuffix: true })}</span>
                  </div>
                  {team.memberCount && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members</span>
                      <span>{team.memberCount}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  {currentTeam?.id !== team.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentTeam(team)}
                      className="flex-1"
                    >
                      Switch to Team
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTeam(team);
                        setIsEditOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {isOwner && !team.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
            <DialogDescription>
              Update team information
            </DialogDescription>
          </DialogHeader>
          {editingTeam && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Team Name</Label>
                <Input
                  id="edit-name"
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTeam}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}