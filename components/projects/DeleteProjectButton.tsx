'use client';

import { useState } from 'react';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { deleteProjectAction } from '@/app/(dashboard)/dashboard/projects/actions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

const DeleteProjectButton = ({ projectId }: { projectId: string }) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const deleteProject = async () => {
    setIsPending(true);

    try {
      const result = await deleteProjectAction(projectId);

      if (!result.success) {
        toast.add({
          type: 'error',
          title: 'Project not deleted',
          description: result.error,
        });
        return;
      }

      toast.add({
        type: 'success',
        title: 'Project deleted',
        description: 'The project has been removed from your workspace.',
      });

      router.push('/dashboard/projects');
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant='destructive'>
            <Trash2 />
            Delete project
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this project?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the project. Future songs, sessions, tracks,
            takes, and notes stored under it will also be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant='destructive'
            disabled={isPending}
            onClick={deleteProject}
          >
            Delete project
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteProjectButton;
