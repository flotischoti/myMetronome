import { useEffect, useRef } from 'react'

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

export const useCommandHandler = (
  command: string | undefined,
  onMessage: (message: string, type: ToastType) => void,
) => {
  const lastProcessed = useRef<string | null>(null)

  useEffect(() => {
    if (!command) return

    // Prevent duplicate processing
    if (lastProcessed.current === command) {
      console.log('⚠️ Same command as last time, skipping:', command)
      return
    }

    console.log('✅ Processing new command:', command)
    lastProcessed.current = command

    // Extract command without timestamp
    let actualCommand = command
    const timestampIndex = command.lastIndexOf(':')
    if (timestampIndex > 0) {
      const possibleTimestamp = command.substring(timestampIndex + 1)
      if (/^\d+$/.test(possibleTimestamp)) {
        actualCommand = command.substring(0, timestampIndex)
        console.log('📅 Extracted command without timestamp:', actualCommand)
      }
    }

    // 1. Try predefined commands
    const config = COMMAND_CONFIG[actualCommand as CommandType]
    if (config) {
      console.log('✅ Found predefined command:', actualCommand, config)
      onMessage(config.message, config.type)
      return
    }

    // 2. Try custom JSON message
    try {
      const parsed = JSON.parse(actualCommand) as {
        message: string
        type: ToastType
      }
      if (parsed.message && parsed.type) {
        console.log('✅ Found custom JSON command:', parsed)
        onMessage(parsed.message, parsed.type)
        return
      }
    } catch {
      console.warn(`❌ Unknown command: ${actualCommand}`)
    }
  }, [command, onMessage])
}
