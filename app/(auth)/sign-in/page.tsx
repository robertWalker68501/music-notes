import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import SignInForm from '@/components/forms/auth/SignInForm';
import { auth } from '@/lib/auth';

const SignInPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user.emailVerified) {
    redirect('/dashboard');
  }

  if (session) {
    redirect('/verify');
  }

  return (
    <div className='w-full'>
      <SignInForm />
    </div>
  );
};

export default SignInPage;
