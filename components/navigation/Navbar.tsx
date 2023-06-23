import { IconMenu2, IconPlus } from '@tabler/icons-react'
import Link from 'next/link'

export default function Navbar({ isLoggedIn }) {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <Link
          href="/"
          prefetch={false}
          className="btn btn-ghost normal-case text-xl"
        >
          MyMetronome
        </Link>
        <button className="btn btn-accent">
          <IconPlus />
          New
        </button>
      </div>
      <div className="flex-none gap-2">
        {isLoggedIn ? (
          <>
            <div className="form-control">
              <input
                type="text"
                placeholder="Search"
                className="input input-bordered w-24 md:w-auto"
              />
            </div>
            <div>
              <label
                htmlFor="my-drawer"
                tabIndex={0}
                className="btn btn-ghost btn-circle  avatar drawer-button"
              >
                {/* <div className="w-10 rounded-full"> */}
                <IconMenu2 />
                {/* </div> */}
              </label>
            </div>
          </>
        ) : (
          <>
            <Link prefetch={false} href="/login" className="link link-hover">
              Login
            </Link>
            <div className="divider divider-horizontal"></div>
            <Link prefetch={false} href="/register" className="link link-hover">
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
