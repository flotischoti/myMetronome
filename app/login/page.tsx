'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { loginServerAction } from '../actions'
import { IconLogin } from '@tabler/icons-react'

export default function Page() {
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const targetUrl = searchParams.get('target')
  let [pendingLogin, startTransitionLogin] = useTransition()

  async function callLoginServerAction(formData: FormData) {
    console.log(`Calling loginServerAction from Client Component`)
    startTransitionLogin(() => {
      loginServerAction(formData).then((res) => {
        if (res) setError(res.text!)
      })
    })
  }

  return (
    <>
      <title>MyMetronome - Login</title>
      <section className="flex flex-col items-center h-full justify-between">
        <div className="max-w-sm bg-white rounded-lg shadow">
          <div className="p-6 space-y-4 sm:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl">
              Login
            </h1>
            <form
              className="space-y-4 sm:space-y-6"
              action={callLoginServerAction}
            >
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
              <button
                type="submit"
                className={`btn ${
                  pendingLogin ? 'btn-disabled' : 'btn-primary'
                } w-full`}
              >
                {pendingLogin ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <IconLogin />
                )}
                Login
              </button>
              {error && <span className="mt-4 text-red-600">{error}</span>}
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

        <p className="text-sm text-center bg-info p-1">
          By logging in you agree to a single cookie being set to handle the
          session. It will expire after logout or 48 hours of inactivity.
        </p>
      </section>
    </>
  )
}
