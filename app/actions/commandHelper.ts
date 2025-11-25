// app/actions/commandHelper.ts
import { cookies } from 'next/headers'

type ToastType = 'success' | 'error' | 'info'

/**
 * Set predefined command cookie
 */
export function setCommand(
  command: string,
  options?: { maxAge?: number; path?: string },
) {
  cookies().set('command', command, {
    httpOnly: false,
    maxAge: options?.maxAge ?? 5,
    path: options?.path ?? '/',
    sameSite: 'strict',
  })
}

/**
 * Set custom error message
 */
export function setErrorCommand(
  message: string,
  options?: { maxAge?: number; path?: string },
) {
  const command = JSON.stringify({ message, type: 'error' })
  setCommand(command, options)
}

/**
 * Check if error is a Next.js redirect
 *
 * Next.js throws errors for redirects internally.
 * These should NOT be caught as application errors.
 */
export function isRedirectError(error: unknown): boolean {
  return (
    error instanceof Error &&
    'digest' in error &&
    typeof (error as any).digest === 'string' &&
    (error as any).digest.startsWith('NEXT_REDIRECT')
  )
}
