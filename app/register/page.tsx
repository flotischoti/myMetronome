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
        pending ? 'btn-disabled' : 'btn-neutral'
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
        <div className="w-full max-w-sm rounded-lg shadow xl:p-0">
          <div className="p-4 sm:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight sm:text-2xl">
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
                  maxLength={20}
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
                  minLength={8}
                  placeholder="••••••••"
                  className="input input-bordered w-full"
                  required={true}
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
                />
                <label className="label">
                  <span className="label-text-alt">
                    Take care. Password reset not yet implemented.
                  </span>
                </label>
              </div>
              <div>
                <SubmitButton />
              </div>
              {state?.message && (
                <span className="mt-4 text-red-600">{state?.message}</span>
              )}
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
            By signing up you agree to the usage of essential cookies to handle
            sessions and page communications. They expire after logout or max 48
            hours of inactivity.
          </p>
        </div>
      </section>
    </>
  )
}
