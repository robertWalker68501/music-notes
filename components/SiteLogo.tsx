import { cn } from 'cn';
import Image from 'next/image';
import Link from 'next/link';

interface SiteLogoProps {
  href: string;
  classNames?: string;
  onClick?: () => void;
  imgSrc?: string;
  imgAlt?: string;
  imgHeight?: number;
  imgWidth?: number;
  text?: string;
}

const SiteLogo = ({
  href,
  classNames,
  onClick,
  imgSrc = '/assets/images/logo-light.png',
  imgAlt = 'MusicNotes Logo',
  imgHeight = 30,
  imgWidth = 30,
  text = 'MusicNotes',
}: SiteLogoProps) => {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2 bg-linear-to-r from-green-800 to-green-400 bg-clip-text text-2xl font-bold text-transparent',
        classNames
      )}
      onClick={onClick}
    >
      <Image
        src={imgSrc}
        alt={imgAlt}
        height={imgHeight}
        width={imgWidth}
      />
      {text}
    </Link>
  );
};

export default SiteLogo;
