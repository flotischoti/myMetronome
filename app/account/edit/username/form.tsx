'use client'

import Link from 'next/link'
import { IconDeviceFloppy } from '@tabler/icons-react'
import { updateUsernameServerAction } from '@/app/actions/actions'
import { FormEvent, useTransition } from 'react'
import { ToastContainer } from '@/components/toast/ToastContainer'

interface ChangeUserProps {
  userName: string
  command: string | undefined
}

export const Form = ({ userName, command }: ChangeUserProps) => {
  const [isUpdating, startTransition] = useTransition()

  const handleUpdate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      await updateUsernameServerAction(new FormData(e.currentTarget))
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
              Edit Username
            </Link>
          </li>
        </ul>
      </div>
      <form onSubmit={handleUpdate}>
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
              pattern="[^\s]+"
              title="1-20 characters, No whitespaces"
            />
            <SubmitButton />
          </div>
        </div>
      </form>
      <ToastContainer command={command} />
    </div>
  )
}
