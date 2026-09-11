import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import SignUpForm from '@/components/forms/auth/SignUpForm';
import { auth } from '@/lib/auth';

const SignUpPage = async () => {
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
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;
