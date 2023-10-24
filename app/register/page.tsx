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
      className={`btn ${
        pending ? 'btn-disabled' : 'btn-primary'
      } w-full btn-outline`}
    >
      {pending ? (
        <span className="loading loading-spinner loading-xs" />
      ) : (
        <IconUserPlus />
      )}
      Sign up
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
      <title>Metronomes - Sign up</title>
      <section className="flex flex-col h-full justify-between items-center">
        <div className="max-w-sm rounded-lg shadow xl:p-0">
          <div className="p-6 sm:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl">
              Create account
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
              <div>
                <SubmitButton />
              </div>
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
