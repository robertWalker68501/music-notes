import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { ArrowLeft } from 'lucide-react';

import ProjectForm from '@/components/forms/projects/ProjectForm';
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

const EditProjectPage = async ({
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
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      <Button
        variant='ghost'
        className='w-fit'
        nativeButton={false}
        render={<Link href={`/dashboard/projects/${project.id}`} />}
      >
        <ArrowLeft />
        Back to project
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>
            <h1>Edit project</h1>
          </CardTitle>
          <CardDescription>
            Update the details that describe this recording project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm
            mode='edit'
            projectId={project.id}
            defaultValues={{
              name: project.name,
              description: project.description ?? '',
              type: project.type,
              status: project.status,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProjectPage;
