import Link from 'next/link';

interface LogoProps {
  href?: string;
  className?: string;
}

export default function Logo({ href = '/', className = '' }: LogoProps) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
    >
      <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
        <span className="text-black font-bold text-sm">T</span>
      </div>
      <span className="text-white text-sm font-semibold">TradeAutopsy</span>
    </Link>
  );
}

