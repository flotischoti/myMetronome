import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '../../api/util'
import { get, remove, update } from '../../../db/user'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import * as bcrypt from 'bcrypt'
import Link from 'next/link'

export default async function Page() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const userName = await getUserAttrFromToken<string>(token!.value, 'name')

  async function deleteUser(data: FormData) {
    'use server'
    const oldPw = data.get('password')!.toString()
    const user = await get(userName!)

    if (user && (await bcrypt.compare(oldPw, user.password))) {
      await remove(user!)

      cookies().set({
        name: 'token',
        value: 'abc',
        secure: true,
        httpOnly: true,
        sameSite: 'lax',
        expires: new Date('January 01, 1970 00:00:00 GMT'),
      })
      revalidatePath('/account')
      redirect('/metronome/new')
    }
    throw new Error('Deleting user failed')
  }

  return (
    <>
      <title>MyMetronome - Delete Account</title>
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
        <form action={deleteUser}>
          <h1 className="font-bold text-lg">Delete account</h1>
          <p>
            Enter your password and confirm deletion. This will permanently
            remove your account and all associated metronomes.{' '}
          </p>
          <label className="label">
            <span className="label-text">Password *</span>
          </label>
          <div className="join">
            <input
              name="password"
              type="password"
              className="input input-bordered join-item"
              placeholder="**********"
              required
            />
            <button type="submit" className="btn btn-error join-item">
              Delete account
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
