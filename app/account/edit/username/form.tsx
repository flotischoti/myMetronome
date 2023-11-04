'use client'

import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { useFormState } from 'react-dom'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { updateUsernameServerAction } from '@/app/actions'

const initialState = {
  message: '',
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className="btn join-item btn-neutral"
      disabled={pending}
    >
      {pending ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        <IconDeviceFloppy size="16" />
      )}
      Save
    </button>
  )
}

export const Form = ({ userName }: { userName: string }) => {
  const [state, formAction] = useFormState(
    updateUsernameServerAction,
    initialState
  )
  return (
    <>
      <title>Metronomes - Edit name</title>
      <div>
        <div className="text-sm breadcrumbs ">
          <ul>
            <li>
              <Link href="/metronome/recent" prefetch={true}>
                Home
              </Link>
            </li>
            <li>
              <Link href="/account" prefetch={true}>
                Account
              </Link>
            </li>
            <li>
              <Link href="/account/delete" prefetch={true}>
                Edit Username
              </Link>
            </li>
          </ul>
        </div>
        <form action={formAction}>
          <h1 className="font-bold text-lg">Change username</h1>
          <div>
            <label className="label">
              <span className="label-text">Username *</span>
            </label>
            <div className="join">
              <input
                name="username"
                type="text"
                maxLength={20}
                defaultValue={userName!}
                className="join-item input input-bordered"
                required
              />
              <SubmitButton />
            </div>
            {state?.message && (
              <p className="mt-4 text-error">{state?.message}</p>
            )}
          </div>
        </form>
      </div>
    </>
  )
}
