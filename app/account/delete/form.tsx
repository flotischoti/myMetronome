'use client'

import Link from 'next/link'
import { deleteUserServerAction } from '@/app/actions/actions'
import { IconTrash } from '@tabler/icons-react'
import { FormEvent, useTransition } from 'react'
import { ToastContainer } from '@/components/toast/ToastContainer'

interface DeleteUserProps {
  command: string | undefined
}

export const DeleteUserForm = ({ command }: DeleteUserProps) => {
  const [isLoggingIn, startTransition] = useTransition()

  const handleDeleteUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      await deleteUserServerAction(new FormData(e.currentTarget))
    })
  }

  function DeleteButton() {
    return (
      <button type="submit" className="btn btn-error" disabled={isLoggingIn}>
        {isLoggingIn ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <IconTrash size="16" />
        )}
        Delete Account
      </button>
    )
  }

  return (
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
      <form
        onSubmit={handleDeleteUser}
        className="max-w-sm flex flex-col gap-4"
      >
        <h1 className="font-bold text-lg">Delete account</h1>
        <p>
          Enter your password and confirm deletion. This will permanently remove
          your account and all associated metronomes.{' '}
        </p>
        <input
          name="password"
          type="password"
          className="input input-bordered"
          placeholder="**********"
          required
        />
        <DeleteButton />
      </form>
      <ToastContainer command={command} />
    </div>
  )
}
