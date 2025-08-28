'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Mail, Clock, Shield } from 'lucide-react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) router.push('/signin');
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      {/* Main Content */}
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Welcome Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Welcome back, {session.user?.name || session.user?.email?.split('@')[0]}!
              </CardTitle>
              <CardDescription>
                Here's an overview of your dashboard. You can manage your account and access various
                features from here.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Active</div>
                <Badge variant="secondary" className="mt-1">
                  Verified
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Email Status</CardTitle>
                <Mail className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {session.user?.email ? 'Verified' : 'Pending'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{session.user?.email}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Login</CardTitle>
                <Clock className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Today</div>
                <p className="text-xs text-muted-foreground mt-1">Active session</p>
              </CardContent>
            </Card>
          </div>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>Your account details and session information</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Full Name</dt>
                  <dd className="mt-1 text-sm">{session.user?.name || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email Address</dt>
                  <dd className="mt-1 text-sm">{session.user?.email || 'Not provided'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Session Expires</dt>
                  <dd className="mt-1 text-sm">
                    {session.expires ? new Date(session.expires).toLocaleString() : 'Unknown'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">
                    Authentication Provider
                  </dt>
                  <dd className="mt-1 text-sm">
                    {('accessToken' in session) ? 'Credentials' : 'OAuth'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Debug Information (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Debug Information</CardTitle>
                <CardDescription>Development mode only</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
