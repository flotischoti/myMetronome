import { cookies } from 'next/headers'

export { isRedirectError } from 'next/dist/client/components/redirect'

export function setCommand(
  command: string,
  options?: { maxAge?: number; path?: string },
) {
  const commandWithTimestamp = `${command}:${Date.now()}`

  cookies().set('command', commandWithTimestamp, {
    httpOnly: false,
    maxAge: options?.maxAge ?? 2,
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
