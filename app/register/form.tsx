'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signupServerAction } from '../actions/actions'
import { IconUserPlus } from '@tabler/icons-react'
import { FormEvent, useTransition } from 'react'
import { ToastContainer } from '@/components/toast/ToastContainer'

interface SignUpFormProps {
  command: string | undefined
}

export const SignUpForm = ({ command }: SignUpFormProps) => {
  const searchParams = useSearchParams()
  const targetUrl = searchParams.get('target')

  const [isSigningUp, startTransition] = useTransition()

  const handleSignUp = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      await signupServerAction(new FormData(e.currentTarget))
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
          <IconUserPlus />
        )}
        Sign up
      </button>
    )
  }

  return (
    <section className="flex flex-col h-full justify-between items-center">
      <div className="w-full max-w-sm rounded-lg shadow xl:p-0">
        <div className="p-4 sm:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            Create account
          </h1>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSignUp}>
            <input
              type="hidden"
              name="target"
              value={searchParams.get('target') || ''}
            />
            <div>
              <label htmlFor="name" className="label">
                <span className="label-text">Username *</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                maxLength={20}
                className="input input-bordered w-full"
                placeholder="Your Username"
                required={true}
                autoFocus
                pattern="[^\s]+"
                title="1-20 characters, No whitespaces"
              />
            </div>
            <div className="hidden">
              <label htmlFor="email" className="label">
                <span className="label-text">Recovery Email</span>
              </label>
              <input
                type="hidden"
                name="email"
                id="email"
                className="input input-bordered w-full"
                placeholder="Your Email"
              />
              <label className="label">
                <span className="label-text-alt">
                  Optional. Only needed to recover password.
                </span>
              </label>
            </div>
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
            <div className="form-control">
              <label htmlFor="passwordRepeat" className="label">
                <span className="label-text">Password Repeat*</span>
              </label>
              <input
                type="password"
                name="passwordRepeat"
                id="passwordRepeat"
                minLength={8}
                placeholder="••••••••"
                className="input input-bordered w-full"
                required={true}
                pattern="[^\s]+"
                title="At least 8 characters. No whitespaces."
              />
              <label className="label">
                <span className="label-text-alt">
                  Take care. Password reset not possible.
                </span>
              </label>
            </div>
            <div>
              <SubmitButton />
            </div>
            <p className="text-sm font-light">
              Already have an account?{' '}
              <Link
                href={targetUrl ? `/login?target=${targetUrl}` : '/login'}
                prefetch={false}
                className="font-medium hover:underline"
              >
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div className="alert alert-info max-w-md text-center rounded-none">
        <p className="select-none text-xs">
          By signing up you agree to the{' '}
          <Link href="/privacy" className="link">
            Privacy Policy
          </Link>{' '}
          and the usage of essential cookies to handle sessions and page
          communications. Cookies expire after logout or max 48 hours of
          inactivity.
        </p>
      </div>
      <ToastContainer command={command} />
    </section>
  )
}
