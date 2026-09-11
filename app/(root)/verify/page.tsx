import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { MdOutlineMail } from 'react-icons/md';

import ResendVerificationForm from '@/components/forms/auth/ResendVerificationForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth';

const VerifyAccountPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.emailVerified) {
    redirect('/dashboard');
  }

  return (
    <div className='flex min-h-dvh flex-col items-center justify-center px-4'>
      <Card className='w-full max-w-lg'>
        <CardHeader className='text-center'>
          <div className='mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary'>
            <MdOutlineMail className='size-6' />
          </div>
          <CardTitle>
            <h1>Check your email</h1>
          </CardTitle>
          <CardDescription>
            We sent you a verification link. Verify your email address before
            signing in to Music Notes.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-5'>
          <p className='text-center text-sm text-muted-foreground'>
            Didn&apos;t receive the email? Enter your address below and we&apos;ll
            send you a new verification link.
          </p>
          <ResendVerificationForm email={session?.user.email} />
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyAccountPage;
