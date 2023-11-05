'use client'

import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { useFormState } from 'react-dom'
import { deleteUserServerAction } from '@/app/actions'
import { IconTrash } from '@tabler/icons-react'

const initialState = {
  message: '',
}

function DeleteButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" className="btn btn-error" disabled={pending}>
      {pending ? (
        <span className="loading loading-spinner loading-xs"></span>
      ) : (
        <IconTrash size="16" />
      )}
      Delete Account
    </button>
  )
}

export default function Page() {
  const [state, formAction] = useFormState(deleteUserServerAction, initialState)

  return (
    <>
      <title>Metronomes - Delete Account</title>
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
                Delete
              </Link>
            </li>
          </ul>
        </div>
        <form action={formAction} className="max-w-sm flex flex-col gap-4">
          <h1 className="font-bold text-lg">Delete account</h1>
          <p>
            Enter your password and confirm deletion. This will permanently
            remove your account and all associated metronomes.{' '}
          </p>
          <input
            name="password"
            type="password"
            className="input input-bordered"
            placeholder="**********"
            required
          />
          <DeleteButton />
          {state?.message && (
            <p className="mt-4 text-error">{state?.message}</p>
          )}
        </form>
      </div>
    </>
  )
}
