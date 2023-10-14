'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { signupServerAction } from '../actions'
import { IconUserPlus } from '@tabler/icons-react'
import { experimental_useFormStatus as useFormStatus } from 'react-dom'
import { experimental_useFormState as useFormState } from 'react-dom'

const SubmitButton = function () {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className={`btn ${pending ? 'btn-disabled' : 'btn-primary'} w-full`}
    >
      {pending ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <IconUserPlus />
      )}
      Create an account
    </button>
  )
}

const initialState = {
  message: '',
}

export default function Page() {
  const searchParams = useSearchParams()
  const targetUrl = searchParams.get('target')
  const [state, formAction] = useFormState(signupServerAction, initialState)

  return (
    <>
      <title>MyMetronome - Sign up</title>
      <section className="flex flex-col h-full justify-between items-center">
        <div className="max-w-sm bg-white rounded-lg shadow xl:p-0">
          <div className="p-6 space-y-4 sm:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl">
              Create an account
            </h1>
            <form className="space-y-4" action={formAction}>
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
                  placeholder="••••••••"
                  className="input input-bordered w-full"
                  required={true}
                />
              </div>
              <SubmitButton />
              {state?.message && (
                <span className="mt-4 text-red-600">{state?.message}</span>
              )}
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href={targetUrl ? `/login?target=${targetUrl}` : '/login'}
                  prefetch={false}
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
        <p className="text-sm text-center bg-emerald-100 p-1">
          By signing up you agree to a single cookie being set to handle the
          session. It will expire after logout or 48 hours of inactivity.
        </p>
      </section>
    </>
  )
}
