'use client';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { useTeams } from '@/contexts/teams-context';

export function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { teams } = useTeams();
  
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    
    if (parts[0] === 'teams') {
      if (parts[1]) {
        const team = teams.find(t => t.id === parts[1]);
        if (parts[2] === 'members') {
          return {
            middle: team?.name || 'Team',
            last: 'Members'
          };
        }
        return {
          middle: 'Teams',
          last: team?.name || 'Team'
        };
      }
      return {
        middle: null,
        last: 'Teams'
      };
    }
    
    return {
      middle: null,
      last: 'Dashboard'
    };
  };
  
  const breadcrumbs = getBreadcrumbs();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">MVP Template</BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.middle && (
                  <>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href={`/${breadcrumbs.middle.toLowerCase()}`}>
                        {breadcrumbs.middle}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </>
                )}
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{breadcrumbs.last}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}