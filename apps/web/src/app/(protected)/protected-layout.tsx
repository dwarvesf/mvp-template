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

export function ProtectedLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const getBreadcrumbs = () => {
    const parts = pathname.split('/').filter(Boolean);
    
    if (parts.length === 0) {
      return {
        middle: null,
        last: 'Dashboard'
      };
    }
    
    // Capitalize first letter of the page name
    const lastPart = parts[parts.length - 1];
    const pageName = lastPart ? lastPart.charAt(0).toUpperCase() + lastPart.slice(1) : 'Page';
    
    return {
      middle: parts.length > 1 ? 'Pages' : null,
      last: pageName
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