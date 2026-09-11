import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { ArrowLeft, FileMusic, Pencil, Plus } from 'lucide-react';

import DeleteProjectButton from '@/components/projects/DeleteProjectButton';
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

const ProjectPage = async ({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect('/sign-in');

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: session.user.id },
  });

  if (!project) notFound();

  return (
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-6'>
      <Button
        variant='ghost'
        className='w-fit'
        nativeButton={false} render={<Link href='/dashboard/projects' />}
      >
        <ArrowLeft />
        Back to projects
      </Button>

      <div className='flex flex-col justify-between gap-5 lg:flex-row lg:items-start'>
        <div className='space-y-3'>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='outline'>{projectTypeLabel(project.type)}</Badge>
            <Badge variant='secondary'>{projectStatusLabel(project.status)}</Badge>
          </div>
          <div>
            <h1 className='font-heading text-3xl font-semibold tracking-tight sm:text-4xl'>
              {project.name}
            </h1>
            <p className='mt-2 max-w-3xl text-muted-foreground'>
              {project.description || 'No description has been added to this project yet.'}
            </p>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button
            variant='outline'
            nativeButton={false} render={<Link href={`/dashboard/projects/${project.id}/edit`} />}
          >
            <Pencil />
            Edit project
          </Button>
          <DeleteProjectButton projectId={project.id} />
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardDescription>Created</CardDescription>
            <CardTitle className='text-lg'>
              {project.createdAt.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Last updated</CardDescription>
            <CardTitle className='text-lg'>
              {project.updatedAt.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Current stage</CardDescription>
            <CardTitle className='text-lg'>{projectStatusLabel(project.status)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-lg bg-muted'>
              <FileMusic className='size-5' />
            </div>
            <div>
              <CardTitle>Songs</CardTitle>
              <CardDescription>
                Songs are the next layer of the Music Notes recording workflow.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col items-start gap-3 rounded-lg border border-dashed p-6'>
            <p className='text-sm text-muted-foreground'>
              Song management will be added next. This project is ready to become
              the home for its songs and recording sessions.
            </p>
            <Button disabled variant='outline'>
              <Plus />
              Add song
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectPage;
