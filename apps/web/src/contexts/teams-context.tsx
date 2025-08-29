'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
  useOrganizationsControllerGetUserOrganizations,
  useOrganizationsControllerCreateOrganization,
  useOrganizationsControllerUpdateOrganization,
  useOrganizationsControllerDeleteOrganization,
} from '@mvp-template/api-client/src/generated';
import { toast } from 'sonner';

interface Team {
  id: string;
  name: string;
  slug: string;
  isDefault: boolean;
  role: string;
  memberCount?: number;
  createdAt: string;
  settings?: Record<string, any>;
}

interface TeamsContextType {
  teams: Team[];
  currentTeam: Team | null;
  isLoading: boolean;
  setCurrentTeam: (team: Team) => void;
  createTeam: (name: string, slug?: string) => Promise<void>;
  updateTeam: (teamId: string, updates: { name?: string; settings?: any }) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  refreshTeams: () => void;
  refetch: () => void;
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export function TeamsProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  
  const { 
    data: orgsData, 
    isLoading,
    refetch: refreshTeams 
  } = useOrganizationsControllerGetUserOrganizations({
    query: {
      enabled: status === 'authenticated',
    },
  });

  const createOrgMutation = useOrganizationsControllerCreateOrganization({
    mutation: {
      onSuccess: () => {
        toast.success('Team created successfully');
        refreshTeams();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to create team');
      },
    },
  });

  const updateOrgMutation = useOrganizationsControllerUpdateOrganization({
    mutation: {
      onSuccess: () => {
        toast.success('Team updated successfully');
        refreshTeams();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to update team');
      },
    },
  });

  const deleteOrgMutation = useOrganizationsControllerDeleteOrganization({
    mutation: {
      onSuccess: () => {
        toast.success('Team deleted successfully');
        refreshTeams();
      },
      onError: (error: any) => {
        toast.error(error?.response?.data?.message || 'Failed to delete team');
      },
    },
  });

  // Map organizations to teams
  const teams: Team[] = React.useMemo(() => {
    if (!orgsData?.data) return [];
    
    const organizations = (orgsData.data as any)?.organizations || [];
    return organizations.map((org: any) => ({
      id: org.id,
      name: org.name,
      slug: org.slug,
      isDefault: org.isDefault || false,
      role: org.role || 'Member',
      memberCount: org._count?.members || 0,
      createdAt: org.createdAt,
      settings: org.settings,
    }));
  }, [orgsData]);

  // Set default team as current if none selected
  useEffect(() => {
    if (teams.length > 0 && !currentTeam) {
      const defaultTeam = teams.find(t => t.isDefault) || teams[0];
      if (defaultTeam) {
        setCurrentTeam(defaultTeam);
      }
    }
  }, [teams, currentTeam]);

  const createTeam = async (name: string, slug?: string) => {
    const data = slug ? { name, slug } : { name };
    await createOrgMutation.mutateAsync({
      data,
    });
  };

  const updateTeam = async (teamId: string, updates: { name?: string; settings?: any }) => {
    await updateOrgMutation.mutateAsync({
      orgId: teamId,
      data: updates,
    });
  };

  const deleteTeam = async (teamId: string) => {
    await deleteOrgMutation.mutateAsync({
      orgId: teamId,
    });
  };

  return (
    <TeamsContext.Provider 
      value={{
        teams,
        currentTeam,
        isLoading,
        setCurrentTeam,
        createTeam,
        updateTeam,
        deleteTeam,
        refreshTeams,
        refetch: refreshTeams,
      }}
    >
      {children}
    </TeamsContext.Provider>
  );
}

export const useTeams = () => {
  const context = useContext(TeamsContext);
  if (!context) {
    throw new Error('useTeams must be used within TeamsProvider');
  }
  return context;
};