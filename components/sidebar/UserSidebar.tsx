import Link from 'next/link';

import { Music2 } from 'lucide-react';

import UserMenu from '@/components/UserMenu';
import UserSidebarNav from '@/components/sidebar/UserSidebarNav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

interface UserSidebarProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

const UserSidebar = ({ user }: UserSidebarProps) => {
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              tooltip='MusicNotes'
              render={<Link href='/dashboard' />}
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                <Music2 className='size-4' />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-heading font-semibold'>
                  MusicNotes
                </span>
                <span className='truncate text-xs text-muted-foreground'>
                  Recording workspace
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <UserSidebarNav />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenu user={user} variant='sidebar' />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default UserSidebar;
