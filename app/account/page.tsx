import Link from 'next/link'
import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '../api/util'

export default async function Page() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const userName = await getUserAttrFromToken<string>(token!.value, 'name')

  return (
    <section>
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
        </ul>
      </div>
      <h1 className="font-bold text-lg">Your Account</h1>
      <div>
        <label className="label">
          <span className="label-text">Username</span>
        </label>
        <div className="input-group">
          <input
            type="text"
            value={userName!}
            className="input input-bordered"
            readOnly
          />
          <Link
            href="/account/edit/username"
            className="btn btn-square"
            prefetch={false}
          >
            EDIT
          </Link>
        </div>
      </div>
      <div>
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <div className="input-group">
          <input
            type="text"
            placeholder="**********"
            className="input input-bordered"
            readOnly
          />
          <Link
            href="/account/edit/password"
            className="btn btn-square"
            prefetch={false}
          >
            EDIT
          </Link>
        </div>
      </div>
      <div className="divider"></div>
      <div>
        <Link href="/account/delete" className="btn btn-error" prefetch={false}>
          Delete Account
        </Link>
      </div>
    </section>
  )
}
