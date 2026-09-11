'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { LayoutDashboard, LogOut } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';

interface UserMenuProps {
  user?: {
    name: string;
    email: string;
    image?: string | null;
  };
  variant?: 'navbar' | 'sidebar';
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'MN';
}

const UserIdentity = ({
  user,
  showDetails,
}: {
  user: NonNullable<UserMenuProps['user']>;
  showDetails: boolean;
}) => (
  <>
    <Avatar className='size-8 rounded-lg'>
      {user.image ? (
        <AvatarImage
          src={user.image}
          alt=''
        />
      ) : null}
      <AvatarFallback className='rounded-lg'>
        {getInitials(user.name)}
      </AvatarFallback>
    </Avatar>

    {showDetails ? (
      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-medium'>{user.name}</span>
        <span className='truncate text-xs text-muted-foreground'>
          {user.email}
        </span>
      </div>
    ) : null}
  </>
);

const UserMenu = ({ user, variant = 'navbar' }: UserMenuProps) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const resolvedUser = user ?? session?.user;

  if (!resolvedUser) {
    return null;
  }

  const menuUser = {
    name: resolvedUser.name,
    email: resolvedUser.email,
    image: resolvedUser.image,
  };

  const signOutUser = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/');
          router.refresh();
        },
      },
    });
  };

  const trigger =
    variant === 'sidebar' ? (
      <SidebarMenuButton
        size='lg'
        className='data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground'
        aria-label='User menu'
      >
        <UserIdentity
          user={menuUser}
          showDetails
        />
      </SidebarMenuButton>
    ) : (
      <button
        type='button'
        aria-label='User menu'
        className='inline-flex size-9 items-center justify-center rounded-full outline-none ring-offset-background transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
      >
        <UserIdentity
          user={menuUser}
          showDetails={false}
        />
      </button>
    );

  const menu = (
    <DropdownMenu>
      <DropdownMenuTrigger render={trigger} />

      <DropdownMenuContent
        className='min-w-56 rounded-lg'
        side={variant === 'sidebar' ? 'right' : 'bottom'}
        align='end'
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col gap-1'>
              <p className='text-sm font-medium leading-none'>{menuUser.name}</p>
              <p className='text-xs leading-none text-muted-foreground'>
                {menuUser.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href='/dashboard' />}>
            <LayoutDashboard />
            Dashboard
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant='destructive'
            onClick={signOutUser}
          >
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (variant === 'sidebar') {
    return (
      <SidebarMenu>
        <SidebarMenuItem>{menu}</SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return menu;
};

export default UserMenu;
