import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { FolderKanban, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { projectStatusLabel, projectTypeLabel } from '@/lib/schemas/ProjectSchema';

const ProjectsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect('/sign-in');

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-8'>
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
        <div className='space-y-2'>
          <h1 className='font-heading text-3xl font-semibold tracking-tight sm:text-4xl'>
            Projects
          </h1>
          <p className='max-w-2xl text-muted-foreground'>
            Organize albums, EPs, singles, demos, and recording ideas. Each project
            will become the home for its songs and recording sessions.
          </p>
        </div>

        <Button nativeButton={false} render={<Link href='/dashboard/projects/new' />}>
          <Plus />
          New project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Empty className='min-h-80 border'>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <FolderKanban />
            </EmptyMedia>
            <EmptyTitle>No projects yet</EmptyTitle>
            <EmptyDescription>
              Create your first recording project to start organizing songs,
              sessions, tracks, and takes.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href='/dashboard/projects/new' />}>
              <Plus />
              Create your first project
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className='h-full transition-colors hover:bg-muted/40'>
                <CardHeader>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <CardTitle className='truncate'>{project.name}</CardTitle>
                      <CardDescription>{projectTypeLabel(project.type)}</CardDescription>
                    </div>
                    <Badge variant='secondary'>{projectStatusLabel(project.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='line-clamp-3 text-sm text-muted-foreground'>
                    {project.description || 'No project description yet.'}
                  </p>
                  <p className='mt-4 text-xs text-muted-foreground'>
                    Updated {project.updatedAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsPage;
