'use client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginServerAction } from '../actions/actions'
import { IconLogin } from '@tabler/icons-react'
import { FormEvent, useTransition } from 'react'
import { ToastContainer } from '@/components/toast/ToastContainer'
import { useCurrentPath } from '../hooks/useCurrentPath'

interface LoginFormProps {
  command: string | undefined
}

export const LoginForm = ({ command }: LoginFormProps) => {
  const searchParams = useSearchParams()
  const targetUrl = searchParams.get('target')

  const [isLoggingIn, startTransition] = useTransition()

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      await loginServerAction(new FormData(e.currentTarget))
    })
  }

  const LoginButton = function () {
    return (
      <button
        type="submit"
        className={`btn ${
          isLoggingIn ? 'btn-disabled' : 'btn-neutral'
        } w-full btn-outline`}
      >
        {isLoggingIn ? (
          <span className="loading loading-spinner loading-xs" />
        ) : (
          <IconLogin />
        )}
        Login
      </button>
    )
  }

  return (
    <section className="flex flex-col items-center h-full justify-between">
      <div className="w-full max-w-sm rounded-lg shadow">
        <div className="p-4">
          <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            Login
          </h1>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <input
              type="hidden"
              name="target"
              value={searchParams.get('target') || ''}
            />
            <input type="hidden" name="currentPath" value={useCurrentPath()} />
            <div>
              <label htmlFor="name" className="label">
                <span className="label-text">Username *</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className="input input-bordered w-full"
                placeholder="Your Username"
                required={true}
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="password" className="label">
                <span className="label-text">Password *</span>
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="••••••••"
                className="input input-bordered w-full"
                required={true}
              />
            </div>
            <LoginButton />
            <p className="text-sm font-light">
              Don&apos;t have an account yet?{' '}
              <Link
                href={targetUrl ? `/register?target=${targetUrl}` : '/register'}
                prefetch={false}
                className="font-medium hover:underline"
              >
                Sign up here
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div className="alert alert-info max-w-md text-center rounded-none">
        <p className="select-none text-xs">
          By logging in you agree to the{' '}
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
