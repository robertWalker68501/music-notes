'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import {
  createProjectAction,
  updateProjectAction,
} from '@/app/(dashboard)/dashboard/projects/actions';
import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import {
  projectSchema,
  projectStatusOptions,
  projectTypeOptions,
  type ProjectInput,
} from '@/lib/schemas/ProjectSchema';

interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  defaultValues?: ProjectInput;
}

const ProjectForm = ({ mode, projectId, defaultValues }: ProjectFormProps) => {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues ?? {
      name: '',
      description: '',
      type: 'OTHER',
      status: 'PLANNING',
    },
  });

  const onSubmit = async (data: ProjectInput) => {
    setIsPending(true);

    try {
      const result =
        mode === 'create'
          ? await createProjectAction(data)
          : await updateProjectAction(projectId!, data);

      if (!result.success) {
        toast.add({
          type: 'error',
          title: mode === 'create' ? 'Project not created' : 'Project not updated',
          description: result.error,
        });
        return;
      }

      toast.add({
        type: 'success',
        title: mode === 'create' ? 'Project created' : 'Project updated',
        description:
          mode === 'create'
            ? 'Your recording project is ready.'
            : 'Your project changes have been saved.',
      });

      router.push(`/dashboard/projects/${result.projectId}`);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
      <FieldGroup>
        <FormFieldControl
          control={form.control}
          name='name'
          label='Project name'
          type='text'
          placeholder='Midnight Demo Sessions'
          autoComplete='off'
          required
        />

        <FormFieldControl
          control={form.control}
          name='description'
          label='Description'
          type='textarea'
          placeholder='What are you recording, and what do you want to remember about this project?'
          rows={5}
          maxLength={2000}
        />

        <div className='grid gap-5 sm:grid-cols-2'>
          <FormFieldControl
            control={form.control}
            name='type'
            label='Project type'
            type='select'
            options={projectTypeOptions.map((option) => ({ ...option }))}
            required
          />

          <FormFieldControl
            control={form.control}
            name='status'
            label='Status'
            type='select'
            options={projectStatusOptions.map((option) => ({ ...option }))}
            required
          />
        </div>
      </FieldGroup>

      <div className='flex flex-wrap gap-3'>
        <Button type='submit' disabled={isPending}>
          {isPending ? <Spinner /> : mode === 'create' ? 'Create project' : 'Save changes'}
        </Button>
        <Button
          type='button'
          variant='outline'
          disabled={isPending}
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
