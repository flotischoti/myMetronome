'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { requestPasswordResetAction } from '../actions/actions'
import { IconMailExclamation } from '@tabler/icons-react'
import { FormEvent, useTransition } from 'react'
import { ToastContainer } from '@/components/toast/ToastContainer'
import { useCurrentPath } from '../hooks/useCurrentPath'

interface ResetPasswordFormProps {
  command: string | undefined
}

export const ResetPasswordForm = ({ command }: ResetPasswordFormProps) => {
  const searchParams = useSearchParams()

  const [isRequesting, startTransition] = useTransition()

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      await requestPasswordResetAction(new FormData(e.currentTarget))
    })
  }

  const ResetButton = function () {
    return (
      <button
        type="submit"
        className={`btn ${
          isRequesting ? 'btn-disabled' : 'btn-neutral'
        } w-full btn-outline`}
      >
        {isRequesting ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <IconMailExclamation />
        )}
        Request Reset Link
      </button>
    )
  }

  return (
    <section className="flex flex-col items-center h-full justify-between">
      <div className="w-full max-w-sm rounded-lg shadow">
        <div className="p-4">
          <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            Reset Password
          </h1>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <input
              type="hidden"
              name="target"
              value={searchParams.get('target') || ''}
            />
            <input type="hidden" name="currentPath" value={useCurrentPath()} />
            <div>
              <label htmlFor="email" className="label">
                <span className="label-text">Enter your email *</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="input input-bordered w-full"
                placeholder="hello@metronomes.com"
                required
              />
            </div>
            <ResetButton />
            <p className="text-sm font-light">
              Back to{' '}
              <Link
                href={'/login'}
                prefetch={false}
                className="font-medium hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
      <ToastContainer command={command} />
    </section>
  )
}
