import { headers } from 'next/headers';

import { NAV_LINKS } from '@/constants';
import { auth } from '@/lib/auth';

import SiteLogo from '../SiteLogo';
import NavLink from './NavLink';
import AuthButtons from '../AuthButtons';
import ThemeToggle from '../ui/theme-toggle';
import UserMenu from '../UserMenu';

const Navbar = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <nav className='flex items-center justify-between'>
      {/* Left side nav content */}
      <div className='flex items-center gap-10'>
        {/* Site Logo*/}
        <SiteLogo href='/' />

        {/* Desktop Nav */}
        <div className='hidden items-center gap-4 md:flex'>
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.id}
              href={link.href}
              label={link.label}
            />
          ))}
        </div>
      </div>

      {/* Right side nav content */}
      <div className='hidden items-center gap-4 md:flex'>
        {session ? <UserMenu /> : <AuthButtons />}
        <ThemeToggle />
      </div>

      {/* Mobile Nav */}
      <div className='block md:hidden'></div>
    </nav>
  );
};

export default Navbar;
