import Link from 'next/link';

interface LogoProps {
  variant?: 'dark' | 'light';
  href?: string;
}

export default function Logo({ variant = 'dark', href }: LogoProps) {
  const baseColor = variant === 'dark' ? 'text-ink' : 'text-cream';
  const inner = (
    <span className={`font-[family-name:var(--font-playfair)] font-black text-xl tracking-tight ${baseColor}`}>
      Next<span className="text-orange">Local</span> AI
    </span>
  );

  if (href) {
    return <Link href={href} className="no-underline">{inner}</Link>;
  }
  return inner;
}
