import { ReactNode } from 'react';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import UserSidebar from '@/components/sidebar/UserSidebar';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { auth } from '@/lib/auth';

const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/sign-in');
  }

  if (!session.user.emailVerified) {
    redirect('/verify');
  }

  return (
    <SidebarProvider>
      <UserSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />

      <SidebarInset>
        <header className='flex h-14 shrink-0 items-center gap-3 border-b px-4 sm:px-6'>
          <SidebarTrigger aria-label='Toggle Sidebar' />
          <Separator
            orientation='vertical'
            className='h-4'
          />
          <span className='font-heading text-sm font-medium'>Workspace</span>
        </header>

        <div className='flex flex-1 flex-col p-4 sm:p-6 lg:p-8'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardLayout;
