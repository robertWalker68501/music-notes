import type { Metadata } from 'next';
import { Public_Sans, JetBrains_Mono } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';
import Providers from '@/providers/Providers';

const jetbrainsMonoHeading = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-heading',
});

const publicSans = Public_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'MusicNotes',
  description:
    'Music Notes helps musicians organize home recording sessions, track takes, document gear and settings, manage projects, and capture every creative detail.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang='en'
      className={cn(
        'h-full',
        'antialiased',
        'font-sans',
        publicSans.variable,
        jetbrainsMonoHeading.variable
      )}
      suppressHydrationWarning
    >
      <body
        className='flex min-h-full flex-col'
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
