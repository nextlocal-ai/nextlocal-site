'use client';

import { gtagEvent } from '@/lib/gtag';

interface Props {
  href: string;
  eventName: string;
  eventParams?: Record<string, unknown>;
  className?: string;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}

export default function TrackableLink({ href, eventName, eventParams, children, ...rest }: Props) {
  return (
    <a
      href={href}
      onClick={() => gtagEvent(eventName, eventParams)}
      {...rest}
    >
      {children}
    </a>
  );
}
