import { useEffect } from 'react'

type ToastType = 'success' | 'error' | 'info'

type CommandType =
  | 'created'
  | 'deleted'
  | 'updated'
  | 'userdeleted'
  | 'passwordChanged'
  | 'usernameChanged'
  | 'unauthorized'
  | 'notFound'

interface CommandConfig {
  message: string
  type: ToastType
}

const COMMAND_CONFIG: Record<CommandType, CommandConfig> = {
  created: { message: 'Metronome created', type: 'success' },
  deleted: { message: 'Metronome deleted', type: 'success' },
  updated: { message: 'Metronome updated', type: 'success' },
  userdeleted: { message: 'User deleted', type: 'info' },
  passwordChanged: {
    message: 'Password changed successfully',
    type: 'success',
  },
  usernameChanged: {
    message: 'Username changed successfully',
    type: 'success',
  },
  unauthorized: { message: 'You are not authorized', type: 'error' },
  notFound: { message: 'Resource not found', type: 'error' },
}

/**
 * Clear command cookie client-side
 */
function clearCommandCookie() {
  if (typeof document !== 'undefined') {
    document.cookie =
      'command=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=strict'
  }
}

export const useCommandHandler = (
  command: string | undefined,
  onMessage: (message: string, type: ToastType) => void,
) => {
  useEffect(() => {
    if (!command) return

    // 1. Try predefined commands
    const config = COMMAND_CONFIG[command as CommandType]
    if (config) {
      onMessage(config.message, config.type)
      clearCommandCookie()
      return
    }

    // 2. Try custom JSON message
    try {
      const parsed = JSON.parse(command) as { message: string; type: ToastType }
      if (parsed.message && parsed.type) {
        onMessage(parsed.message, parsed.type)
        clearCommandCookie()
        return
      }
    } catch {
      console.warn(`Unknown command: ${command}`)
    }
  }, [command, onMessage])
}
