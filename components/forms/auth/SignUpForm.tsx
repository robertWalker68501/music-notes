'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
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
import { createUserSchema } from '@/lib/schemas/UserSchema';

const SignUpForm = () => {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof createUserSchema>>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      callbackURL: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof createUserSchema>) => {
    const { name, email, password } = data;

    setIsPending(true);

    try {
      const { error } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: '/sign-in',
      });

      if (error) {
        toast.add({
          type: 'error',
          title: 'Failed to create account',
          description:
            error.message || 'Please review your details and try again.',
        });
        return;
      }

      toast.add({
        type: 'success',
        title: 'Account created successfully',
        description: 'Check your email to verify your account',
      });

      window.location.assign('/verify');
    } finally {
      setIsPending(false);
    }
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
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>Create your Music Notes account</CardDescription>
      </CardHeader>
      <form
        id='create-account-form'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CardContent>
          <FieldGroup>
            <FormFieldControl
              control={form.control}
              name='name'
              label='Full Name'
              type='text'
              placeholder='John Doe'
              autoComplete='name'
              required
            />
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
              autoComplete='new-password'
              required
            />
            <FormFieldControl
              control={form.control}
              name='confirmPassword'
              label='Confirm Password'
              type='password'
              placeholder='********'
              autoComplete='new-password'
              required
            />
            <div className='flex w-full flex-col gap-4'>
              <div className='flex items-center justify-between'>
                <Button
                  type='submit'
                  form='create-account-form'
                  disabled={isPending}
                >
                  {isPending ? <Spinner /> : 'Sign Up'}
                </Button>
                <p className='text-sm text-muted-foreground'>
                  Already have an account?{' '}
                  <Link
                    href='/sign-in'
                    className='hover:text-primary'
                  >
                    Sign In
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

export default SignUpForm;
