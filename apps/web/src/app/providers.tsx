'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SessionProvider } from 'next-auth/react';
import { ReactNode, useState } from 'react';
import { TeamsProvider } from '@/contexts/teams-context';
import { Toaster } from 'sonner';

export default function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <SessionProvider>
        <TeamsProvider>
          {children}
        </TeamsProvider>
        <Toaster />
      </SessionProvider>
    </QueryClientProvider>
  );
}
