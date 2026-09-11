'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { LuGithub } from 'react-icons/lu';
import * as z from 'zod';

import { FormFieldControl } from '@/components/form-fields/FormFieldControl';
import SeparatorWithText from '@/components/SeparatorWithText';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import { authClient } from '@/lib/auth-client';
import { signInUserSchema } from '@/lib/schemas/UserSchema';

const SignInForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof signInUserSchema>>({
    resolver: zodResolver(signInUserSchema),
    defaultValues: {
      email: '',
      password: '',
      callbackURL: '',
    },
  });

  const onSubmit = (data: z.infer<typeof signInUserSchema>) => {
    const { email, password } = data;

    startTransition(async () => {
      await authClient.signIn.email(
        {
          email,
          password,
          callbackURL: '/dashboard',
        },
        {
          onSuccess: () => {
            toast.add({
              type: 'success',
              title: 'Signed in successfully',
            });
            router.refresh();
          },
          onError: (ctx) => {
            const requiresVerification = ctx.error.status === 403;

            toast.add({
              type: 'error',
              title: requiresVerification
                ? 'Email verification required'
                : 'Failed to sign in',
              description: requiresVerification
                ? 'Verify your email address before signing in.'
                : ctx.error.message ||
                  'Check your email and password, then try again.',
            });

            if (requiresVerification) {
              router.push('/verify');
            }
          },
        },
      );
    });
  };

  const signInWithGoogle = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/dashboard',
    });
  };

  const signInWithGitHub = async () => {
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: '/dashboard',
    });
  };

  return (
    <Card className='mx-auto max-w-lg'>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Sign in to continue to Music Notes</CardDescription>
      </CardHeader>
      <form
        id='sign-in-form'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CardContent>
          <FieldGroup>
            <FormFieldControl
              control={form.control}
              name='email'
              label='Email Address'
              type='email'
              placeholder='john.doe@example.com'
              autoComplete='email'
              required
            />
            <FormFieldControl
              control={form.control}
              name='password'
              label='Password'
              type='password'
              placeholder='********'
              autoComplete='current-password'
              required
            />
            <div className='flex w-full flex-col gap-4'>
              <div className='flex items-center justify-between'>
                <Button
                  type='submit'
                  form='sign-in-form'
                  disabled={isPending}
                >
                  {isPending ? <Spinner /> : 'Sign In'}
                </Button>
                <p className='text-sm text-muted-foreground'>
                  Don&apos;t have an account?{' '}
                  <Link
                    href='/sign-up'
                    className='hover:text-primary'
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
              <SeparatorWithText text='OR' />
              <div className='flex flex-col gap-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={signInWithGoogle}
                  disabled={isPending}
                >
                  Sign in with Google <FcGoogle />
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={signInWithGitHub}
                  disabled={isPending}
                >
                  Sign in with GitHub <LuGithub />
                </Button>
              </div>
            </div>
          </FieldGroup>
        </CardContent>
      </form>
    </Card>
  );
};

export default SignInForm;
