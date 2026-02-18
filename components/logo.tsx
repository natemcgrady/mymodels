'use client'

import Image from 'next/image'
import faviconLight from '@/public/favicon-light.svg'
import faviconDark from '@/public/favicon-dark.svg'

type LogoProps = {
  size?: number
  className?: string
}

export function Logo({ size = 100, className }: LogoProps) {
  const wrapperClassName = className ? `inline-flex ${className}` : 'inline-flex'

  return (
    <span className={wrapperClassName}>
      <Image
        src={faviconLight}
        alt=""
        aria-hidden
        width={size}
        height={size}
        className="block dark:hidden"
      />
      <Image
        src={faviconDark}
        alt=""
        aria-hidden
        width={size}
        height={size}
        className="hidden dark:block"
      />
    </span>
  )
}
