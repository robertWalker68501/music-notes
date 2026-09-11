'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import { authClient } from '@/lib/auth-client';
import { resendVerificationSchema } from '@/lib/schemas/UserSchema';

const ResendVerificationForm = ({ email = '' }: { email?: string }) => {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof resendVerificationSchema>>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email,
    },
  });

  const onSubmit = (data: z.infer<typeof resendVerificationSchema>) => {
    startTransition(async () => {
      await authClient.sendVerificationEmail(
        {
          email: data.email,
          callbackURL: '/sign-in',
        },
        {
          onSuccess: () => {
            toast.add({
              type: 'success',
              title: 'Verification email sent',
              description: 'Check your inbox for a new verification link.',
            });
          },
          onError: (ctx) => {
            toast.add({
              type: 'error',
              title: 'Unable to send verification email',
              description:
                ctx.error.message || 'Please wait a moment and try again.',
            });
          },
        },
      );
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <FormFieldControl
          control={form.control}
          name='email'
          label='Email Address'
          type='email'
          placeholder='john.doe@example.com'
          autoComplete='email'
          disabled={isPending}
          required
        />
        <Button
          type='submit'
          disabled={isPending}
          className='w-full'
        >
          {isPending ? <Spinner /> : 'Resend Verification Email'}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default ResendVerificationForm;
