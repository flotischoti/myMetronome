import { cookies } from 'next/headers'

export { isRedirectError } from 'next/dist/client/components/redirect'

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

export function setErrorCommand(
  message: string,
  options?: { maxAge?: number; path?: string },
) {
  const command = JSON.stringify({ message, type: 'error' })
  setCommand(command, options)
}
