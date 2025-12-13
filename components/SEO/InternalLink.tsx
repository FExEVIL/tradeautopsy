import Link from 'next/link'
import { ReactNode } from 'react'

interface InternalLinkProps {
  href: string
  children: ReactNode
  keyword?: string
  className?: string
}

export function InternalLink({
  href,
  children,
  keyword,
  className = 'text-blue-500 hover:underline',
}: InternalLinkProps) {
  return (
    <Link href={href} title={keyword || String(children)} className={className}>
      {children}
    </Link>
  )
}
