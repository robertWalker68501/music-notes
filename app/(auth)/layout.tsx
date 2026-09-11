import { ReactNode } from 'react';

import GoBackButton from '@/components/GoBackButton';

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className='absolute top-5 left-5'>
        <GoBackButton
          href='/'
          text='Go Back'
        />
      </div>
      <div className='my-5 flex h-dvh flex-col items-center justify-center'>
        {children}
      </div>
    </>
  );
};

export default AuthLayout;
