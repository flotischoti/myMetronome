'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { loginServerAction } from '../actions'
import { IconLogin } from '@tabler/icons-react'
import { experimental_useFormStatus as useFormStatus } from 'react-dom'
import { experimental_useFormState as useFormState } from 'react-dom'

const initialState = {
  message: '',
}

const LoginButton = function () {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={`btn ${
        pending ? 'btn-disabled' : 'btn-primary'
      } w-full btn-outline`}
    >
      {pending ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <IconLogin />
      )}
      Login
    </button>
  )
}

export default function Page() {
  const searchParams = useSearchParams()
  const targetUrl = searchParams.get('target')
  const [state, formAction] = useFormState(loginServerAction, initialState)

  return (
    <>
      <title>Metronomes - Login</title>
      <section className="flex flex-col items-center h-full justify-between">
        <div className="max-w-sm rounded-lg shadow">
          <div className="p-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl">
              Login
            </h1>
            <form className="space-y-4 sm:space-y-6" action={formAction}>
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
              {state?.message && (
                <span className="mt-4 text-red-600">{state?.message}</span>
              )}
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don&apos;t have an account yet?{' '}
                <Link
                  href={
                    targetUrl ? `/register?target=${targetUrl}` : '/register'
                  }
                  prefetch={false}
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign up here
                </Link>
              </p>
            </form>
          </div>
        </div>
        <div className="alert alert-info max-w-md text-center">
          <p className="select-none">
            By logging in you agree to the usage of cookies to handle sessions
            and page communications. They expire after logout or 48 hours of
            inactivity.
          </p>
        </div>
      </section>
    </>
  )
}
