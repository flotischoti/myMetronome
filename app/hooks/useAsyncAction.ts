import { useTransition, useEffect, useRef, useCallback } from 'react'

interface UseAsyncActionOptions {
  onSuccess?: (message?: string) => void
  onError?: (error: string) => void
  successMessage?: string
  errorMessage?: string
}

export const useAsyncAction = <T extends any[]>(
  action: (...args: T) => Promise<void> | void,
  options: UseAsyncActionOptions = {},
) => {
  const [isPending, startTransition] = useTransition()
  const prevPending = useRef(false)

  const optionsRef = useRef(options)

  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    if (isPending) {
      prevPending.current = true
    } else if (prevPending.current) {
      prevPending.current = false
    }
  }, [isPending])

  const actionRef = useRef(action)

  useEffect(() => {
    actionRef.current = action
  }, [action])

  const execute = useCallback((...args: T) => {
    startTransition(async () => {
      try {
        await actionRef.current(...args)
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : optionsRef.current.errorMessage || 'Something went wrong'
        optionsRef.current.onError?.(errorMsg)
      }
    })
  }, [])

  return {
    execute,
    isPending,
    isIdle: !isPending && !prevPending.current,
  }
}
