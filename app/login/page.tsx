'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { loginServerAction } from '../actions'

interface FormElements extends HTMLFormControlsCollection {
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

  async function handleSubmit(e: FormEvent<LoginFormElement>) {
    e.preventDefault()

    const data = {
      name: e.currentTarget.elements.name.value,
      password: e.currentTarget.elements.password.value,
    }

    const response = await fetch(`/api/auth/login`, {
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

    // await fetch(`/api/revalidate`, {
    //   cache: 'no-store',
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ path: '/' }),
    // })

    router.refresh()

    router.push(targetUrl ? targetUrl : `/metronome/recent`)
  }

  async function callLoginServerAction(formData: FormData) {
    console.log(`Calling loginServerAction from Client Component`)
    const { status, text } = await loginServerAction(formData)
    if (status == 200) {
      const targetUrl = searchParams.get('target')
      router.push(targetUrl ? targetUrl : `/metronome/recent`)
    }
    setError(text)
  }

  return (
    <section className="flex flex-col items-center h-full justify-between">
      <div className="max-w-sm bg-white rounded-lg shadow">
        <div className="p-6 space-y-4 sm:space-y-6">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 sm:text-2xl">
            Login
          </h1>
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
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
            <button type="submit" className="btn btn-primary w-full">
              Login
            </button>
            {error && <span className="mt-4 text-red-600">{error}</span>}
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Don't have an account yet?{' '}
              <Link
                href={targetUrl ? `/register?target=${targetUrl}` : '/register'}
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
  )
}
