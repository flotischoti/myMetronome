'use client'
import { usePathname, useSearchParams } from 'next/navigation'

export function useCurrentPath(): string {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const search = searchParams.toString()
  return search ? `${pathname}?${search}` : pathname
}
