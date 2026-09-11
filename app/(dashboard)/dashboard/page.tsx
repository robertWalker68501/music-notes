import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  BadgeCheck,
  FolderKanban,
  Mic2,
  Music2,
  Plus,
  SlidersHorizontal,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { projectStatusLabel, projectTypeLabel } from '@/lib/schemas/ProjectSchema';

const workflow = [
  {
    title: 'Projects',
    description: 'Keep each album, EP, demo, or recording idea organized.',
    icon: FolderKanban,
  },
  {
    title: 'Songs',
    description: 'Group songs inside a project and keep their progress together.',
    icon: Music2,
  },
  {
    title: 'Recording sessions',
    description: 'Document every session so you always know what happened.',
    icon: Mic2,
  },
  {
    title: 'Tracks & takes',
    description: 'Capture takes, notes, settings, and the details worth repeating.',
    icon: SlidersHorizontal,
  },
];

const Dashboard = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect('/sign-in');

  const [projectCount, recentProjects] = await Promise.all([
    prisma.project.count({ where: { ownerId: session.user.id } }),
    prisma.project.findMany({
      where: { ownerId: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 3,
    }),
  ]);

  const firstName = session.user.name.trim().split(/\s+/)[0] || 'there';

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8'>
      <section className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div className='space-y-3'>
          <Badge variant='secondary'>
            <BadgeCheck data-icon='inline-start' />
            Workspace ready
          </Badge>
          <div className='space-y-2'>
            <h1 className='font-heading text-3xl font-semibold tracking-tight sm:text-4xl'>
              Welcome back, {firstName}
            </h1>
            <p className='max-w-2xl text-muted-foreground'>
              Music Notes keeps the details of your home recording process in one
              place, from the first project idea to the take you decide to keep.
            </p>
          </div>
        </div>

        <Button nativeButton={false} render={<Link href='/dashboard/projects/new' />}>
          <Plus />
          New project
        </Button>
      </section>

      <section className='grid gap-4 md:grid-cols-3' aria-labelledby='workspace-status-heading'>
        <h2 id='workspace-status-heading' className='sr-only'>Workspace status</h2>

        <Card>
          <CardHeader>
            <CardDescription>Projects</CardDescription>
            <CardTitle className='text-3xl'>{projectCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant='link' className='h-auto p-0' nativeButton={false} render={<Link href='/dashboard/projects' />}>
              View projects
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Email</CardDescription>
            <CardTitle>Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='truncate text-sm text-muted-foreground'>{session.user.email}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Workspace</CardDescription>
            <CardTitle>Personal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Your projects and recording notes are private to your account.
            </p>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby='recent-projects-heading'>
        <Card>
          <CardHeader className='flex-row items-start justify-between gap-4'>
            <div>
              <CardTitle id='recent-projects-heading'>Recent projects</CardTitle>
              <CardDescription>Pick up where you left off.</CardDescription>
            </div>
            {projectCount > 0 ? (
              <Button variant='outline' size='sm' nativeButton={false} render={<Link href='/dashboard/projects' />}>
                View all
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className='flex flex-col items-start gap-3 rounded-lg border border-dashed p-6'>
                <div>
                  <p className='font-medium'>Create your first project</p>
                  <p className='mt-1 text-sm text-muted-foreground'>
                    A project is the starting point for songs, sessions, tracks, takes,
                    gear notes, and everything else you capture.
                  </p>
                </div>
                <Button nativeButton={false} render={<Link href='/dashboard/projects/new' />}>
                  <Plus />
                  Create project
                </Button>
              </div>
            ) : (
              <div className='divide-y'>
                {recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/dashboard/projects/${project.id}`}
                    className='flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0'
                  >
                    <div className='min-w-0'>
                      <p className='truncate font-medium'>{project.name}</p>
                      <p className='text-sm text-muted-foreground'>
                        {projectTypeLabel(project.type)} · {projectStatusLabel(project.status)}
                      </p>
                    </div>
                    <span className='shrink-0 text-xs text-muted-foreground'>
                      {project.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby='recording-workflow-heading'>
        <Card>
          <CardHeader>
            <CardTitle id='recording-workflow-heading'>Your recording workflow</CardTitle>
            <CardDescription>
              Music Notes is organized around the way a home recording project naturally grows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid gap-4 sm:grid-cols-2'>
              {workflow.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className='flex gap-4 rounded-lg border p-4'>
                    <div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted'>
                      <Icon className='size-5' />
                    </div>
                    <div className='min-w-0 space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs font-medium text-muted-foreground'>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <h3 className='font-heading font-medium'>{item.title}</h3>
                      </div>
                      <p className='text-sm text-muted-foreground'>{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
