'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { FormEvent, useTransition } from 'react'
import { ToastContainer } from '@/components/toast/ToastContainer'
import { confirmPasswordResetAction } from '@/app/actions/actions'

interface ConfirmPasswordFormProps {
  command: string | undefined
}

export const ConfirmPasswordResetForm = ({
  command,
}: ConfirmPasswordFormProps) => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isSigningUp, startTransition] = useTransition()

  const handleSignUp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      await confirmPasswordResetAction(new FormData(e.currentTarget))
    })
  }

  const SubmitButton = function () {
    return (
      <button
        type="submit"
        className={`btn ${
          isSigningUp ? 'btn-disabled' : 'btn-neutral'
        } w-full btn-outline`}
      >
        {isSigningUp ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <IconDeviceFloppy />
        )}
        Reset Password
      </button>
    )
  }

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6">
        <div className="alert alert-error">
          <span>Invalid reset link</span>
        </div>
      </div>
    )
  }

  return (
    <section className="flex flex-col h-full justify-between items-center">
      <div className="w-full max-w-sm rounded-lg shadow xl:p-0">
        <div className="p-4 sm:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            Set new password
          </h1>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSignUp}>
            <input type="hidden" name="token" value={token} />
            <div>
              <label htmlFor="password" className="label">
                <span className="label-text">Password *</span>
              </label>
              <input
                type="password"
                name="password"
                id="password"
                minLength={8}
                placeholder="••••••••"
                className="input input-bordered w-full"
                required={true}
                pattern="[^\s]+"
                title="At least 8 characters. No whitespaces."
              />
            </div>
            <div>
              <SubmitButton />
            </div>
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
