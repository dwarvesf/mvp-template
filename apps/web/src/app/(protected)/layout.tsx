import { ProtectedLayoutClient } from './protected-layout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedLayoutClient>{children}</ProtectedLayoutClient>;
}