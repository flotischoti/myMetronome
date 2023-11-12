'use client'

import { updatePasswordServerAction } from '@/app/actions'
import { IconDeviceFloppy } from '@tabler/icons-react'
import Link from 'next/link'
import { useFormStatus } from 'react-dom'
import { useFormState } from 'react-dom'

const initialState = {
  message: '',
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      className="btn btn-square btn-neutral btn-wide mt-4"
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

export const ChangePasswordForm = () => {
  const [state, formAction] = useFormState(
    updatePasswordServerAction,
    initialState,
  )
  return (
    <>
      <title>Metronomes - Edit password</title>
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
                Edit Password
              </Link>
            </li>
          </ul>
        </div>
        <form action={formAction}>
          <h1 className="font-bold text-lg">Change password</h1>
          <div>
            <label className="label">
              <span className="label-text">Old password *</span>
            </label>
            <input
              name="oldPw"
              type="password"
              defaultValue=""
              className="input input-bordered"
              required
            />
            <label className="label">
              <span className="label-text">New password *</span>
            </label>
            <input
              name="newPw"
              type="password"
              defaultValue=""
              minLength={8}
              className="input input-bordered"
              required
              pattern="[^\s]+"
              title="At least 8 characters. No whitespaces."
            />
            <label className="label">
              <span className="label-text">New password confirm *</span>
            </label>
            <input
              name="newPwConfirm"
              type="password"
              minLength={8}
              defaultValue=""
              className="input input-bordered"
              required
              pattern="[^\s]+"
              title="At least 8 characters. No whitespaces."
            />
          </div>
          <SubmitButton />
          {state?.message && (
            <p className="mt-4 text-error">{state?.message}</p>
          )}
        </form>
      </div>
    </>
  )
}
