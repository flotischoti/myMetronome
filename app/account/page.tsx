import Link from 'next/link'
import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '../../lib/jwt'
import { Metadata } from 'next'
import { ToastContainer } from '@/components/toast/ToastContainer'

export const metadata: Metadata = {
  title: 'Metronomes - Account',
}

export default async function Page() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const command = cookieStore.get('command')
  const userName = await getUserAttrFromToken<string>(token!.value, 'name')
  const email = await getUserAttrFromToken<string>(token!.value, 'email')

  return (
    <section>
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
        </ul>
      </div>
      <h1 className="font-bold text-lg">Your Account</h1>
      <div>
        <label className="label">
          <span className="label-text">Username</span>
        </label>
        <div className="join">
          <input
            type="text"
            value={userName!}
            className="join-item input input-bordered input-disabled"
            readOnly
          />
          <Link
            href="/account/edit/username"
            className="join-item btn btn-square btn-neutral"
            prefetch={true}
          >
            EDIT
          </Link>
        </div>
      </div>
      <div>
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <div className="join">
          <input
            type="text"
            value={email || ''}
            className="join-item input input-bordered input-disabled"
            readOnly
          />
          <Link
            href="/account/edit/email"
            className="join-item btn btn-square btn-neutral"
            prefetch={true}
          >
            EDIT
          </Link>
        </div>
      </div>
      <div>
        <label className="label">
          <span className="label-text">Password</span>
        </label>
        <div className="join">
          <input
            type="text"
            placeholder="**********"
            className="join-item input input-bordered input-disabled"
            readOnly
          />
          <Link
            href="/account/edit/password"
            className="join-item btn btn-square btn-neutral"
            prefetch={true}
          >
            EDIT
          </Link>
        </div>
      </div>
      <div className="divider"></div>
      <div>
        <Link href="/account/delete" className="btn btn-error" prefetch={true}>
          Delete Account
        </Link>
      </div>
      <ToastContainer command={command?.value} />
    </section>
  )
}
