'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { loginServerAction } from '../actions'

interface FormElements extends HTMLFormControlsCollection {
  email: HTMLInputElement
  password: HTMLInputElement
}
interface LoginFormElement extends HTMLFormElement {
  readonly elements: FormElements
}

export default function Page() {
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  async function handleSubmit(e: FormEvent<LoginFormElement>) {
    e.preventDefault()

    const data = {
      email: e.currentTarget.elements.email.value,
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
      setError(result.status)
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

    const targetUrl = searchParams.get('target')

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
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Login
            </h1>
            <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Your email *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="name@something.com"
                  required={true}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required={true}
                />
              </div>
              <button
                type="submit"
                className="w-full text-white bg-gray-600 hover:bg-gray-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Login
              </button>
              {error && <span className="mt-4 text-red-600">{error}</span>}
              <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                Don't have an account yet?{' '}
                <Link
                  href="/register"
                  prefetch={false}
                  className="font-medium text-primary-600 hover:underline dark:text-primary-500"
                >
                  Sign up here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
