import { useEffect } from 'react'

type CommandType = 'created' | 'deleted' | 'userdeleted'

const COMMAND_MESSAGES: Record<CommandType, string> = {
  created: 'Metronome created',
  deleted: 'Metronome deleted',
  userdeleted: 'User deleted',
}

/**
 * Custom Hook für URL Command Handling
 *
 * Zeigt Success-Messages basierend auf URL-Parametern (z.B. nach Redirect)
 */
export const useCommandHandler = (
  command: string | undefined,
  onMessage: (message: string, type: 'success' | 'error' | 'info') => void,
) => {
  useEffect(() => {
    if (!command) return

    const message = COMMAND_MESSAGES[command as CommandType]
    if (message) {
      onMessage(message, 'success')
    }
  }, [command, onMessage])
}
