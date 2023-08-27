import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '../../../api/util'
import { get, update } from '../../../../db/user'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import * as bcrypt from 'bcrypt'
import Link from 'next/link'

export default async function Page() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const userName = await getUserAttrFromToken<string>(token!.value, 'name')

  async function updatePassword(data: FormData) {
    'use server'
    const oldPw = data.get('oldPw')!.toString()
    const newPw = data.get('newPw')!.toString()

    const user = await get(userName!)
    if (user && (await bcrypt.compare(oldPw, user.password))) {
      const encryptedPw = await bcrypt.hash(newPw, 10)
      user!.password = encryptedPw

      await update(user!)

      revalidatePath('/account')
      redirect('/account')
    }
    throw new Error('Changing passwords failed')
  }

  return (
    <div>
      <div className="text-sm breadcrumbs ">
        <ul>
          <li>
            <Link href="/metronome/recent" prefetch={false}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/account" prefetch={false}>
              Account
            </Link>
          </li>
          <li>
            <Link href="/account/delete" prefetch={false}>
              Edit Password
            </Link>
          </li>
        </ul>
      </div>
      <form action={updatePassword}>
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
            className="input input-bordered"
            required
          />
          <label className="label">
            <span className="label-text">New password confirm *</span>
          </label>
          <input
            name="newPwConfirm"
            type="password"
            defaultValue=""
            className="input input-bordered"
            required
          />
        </div>
        <button type="submit" className="btn btn-square mt-4">
          Save
        </button>
      </form>
    </div>
  )
}
