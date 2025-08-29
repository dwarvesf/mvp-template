'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeams } from '@/contexts/teams-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function NewTeamPage() {
  const router = useRouter();
  const { createTeam } = useTeams();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({
      name,
      slug: generateSlug(name),
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) return;

    setIsLoading(true);
    try {
      await createTeam(formData.name, formData.slug);
      router.push('/teams');
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setIsLoading(false);
    }
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
          <div className="flex flex-col space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Create team</h2>
            <p className="text-sm text-muted-foreground">
              Set up a new team to collaborate with others
            </p>
          </div>
        </div>

        <div className={cn("mx-auto max-w-2xl")}>
          <Card>
            <CardHeader>
              <CardTitle>Team details</CardTitle>
              <CardDescription>
                Enter the information for your new team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Team name</Label>
                    <Input
                      id="name"
                      placeholder="Acme Corporation"
                      value={formData.name}
                      onChange={handleNameChange}
                      required
                      autoFocus
                    />
                    <p className="text-sm text-muted-foreground">
                      This is your team's display name
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="slug">Team URL</Label>
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                        app.com/teams/
                      </span>
                      <Input
                        id="slug"
                        placeholder="acme-corp"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        pattern="[a-z0-9-]+"
                        required
                        className="rounded-l-none"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This will be used in URLs and must be unique. Only lowercase letters, numbers, and hyphens allowed.
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/teams')}
                      disabled={isLoading}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !formData.name || !formData.slug}
                      className="w-full"
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create team
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}