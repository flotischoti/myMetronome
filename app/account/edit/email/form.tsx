'use client'

import Link from 'next/link'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { updateEmailServerAction } from '@/app/actions/actions'
import { FormEvent, useTransition } from 'react'
import { ToastContainer } from '@/components/toast/ToastContainer'

interface UpdateMailProps {
  email: string
  command: string | undefined
}

export const UpdateMailForm = ({ email, command }: UpdateMailProps) => {
  const [isUpdating, startTransition] = useTransition()

  const handleUpdate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      await updateEmailServerAction(new FormData(e.currentTarget))
    })
  }

  function SubmitButton() {
    return (
      <button
        type="submit"
        className="btn join-item btn-neutral"
        disabled={isUpdating}
      >
        {isUpdating ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <IconDeviceFloppy size="16" />
        )}
        Save
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
              Edit Email
            </Link>
          </li>
        </ul>
      </div>
      <form onSubmit={handleUpdate}>
        <h1 className="font-bold text-lg">Change Email</h1>
        <div>
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <div className="join">
            <input
              name="email"
              type="email"
              defaultValue={email!}
              className="join-item input input-bordered"
            />
            <SubmitButton />
          </div>
        </div>
      </form>
      <ToastContainer command={command} />
    </div>
  )
}
