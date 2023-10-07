'use client'

import Link from 'next/link'
import { FormEvent, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { signupServerAction } from '../actions'
import { IconUserPlus } from '@tabler/icons-react'

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement
  name: HTMLInputElement
  password: HTMLInputElement
}
interface LoginFormElement extends HTMLFormElement {
  readonly elements: FormElements
}

export default function Page() {
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const targetUrl = searchParams.get('target')
  let [pendingSignup, startTransitionSignup] = useTransition()

  async function handleSubmit(e: FormEvent<LoginFormElement>) {
    e.preventDefault()

    const data = {
      email: e.currentTarget.elements.email?.value,
      name: e.currentTarget.elements.name.value,
      password: e.currentTarget.elements.password.value,
    }

    const response = await fetch(`/api/auth/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (response.status != 200) {
      setError(result.text)
      return
    }

    router.refresh()
    router.push(targetUrl ? targetUrl : `/metronome/new`)
  }

  async function callSignupServerAction(formData: FormData) {
    console.log(`Calling signupServerAction from Client Component`)
    startTransitionSignup(() => {
      signupServerAction(formData).then((res) => {
        if (res) setError(res.text!)
      })
    })
  }

  return (
    <>
      <title>MyMetronome - Sign up</title>
      <section className="flex flex-col h-full justify-between items-center">
        <div className="max-w-sm bg-white rounded-lg shadow xl:p-0">
          <div className="p-6 space-y-4 sm:space-y-6">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl">
              Create an account
            </h1>
            <form className="space-y-4" action={callSignupServerAction}>
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
                />
              </div>
              <div>
                <label htmlFor="email" className="label">
                  <span className="label-text">Recovery Email</span>
                </label>
                <input
                  type="text"
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
              <button
                type="submit"
                className={`btn ${
                  pendingSignup ? 'btn-disabled' : 'btn-primary'
                } w-full`}
              >
                {pendingSignup ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <IconUserPlus />
                )}
                Create an account
              </button>
              {error && <span className="mt-4 text-red-600">{error}</span>}
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
