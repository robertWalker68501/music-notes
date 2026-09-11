import Link from 'next/link';

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

const NewProjectPage = () => {
  return (
    <div className='mx-auto flex w-full max-w-3xl flex-col gap-6'>
      <Button
        variant='ghost'
        className='w-fit'
        nativeButton={false}
        render={<Link href='/dashboard/projects' />}
      >
        <ArrowLeft />
        Back to projects
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>
            <h1>Create project</h1>
          </CardTitle>
          <CardDescription>
            Start with the big picture. Songs and recording sessions will live
            inside this project as Music Notes grows with your work.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm mode='create' />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProjectPage;
