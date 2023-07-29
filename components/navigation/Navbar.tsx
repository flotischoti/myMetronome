import { IconMenu2, IconPlus } from '@tabler/icons-react'
import Link from 'next/link'
import NavbarSearch from './NavbarSearch'

export default function Navbar({ isLoggedIn }) {
  return (
    <div className="navbar bg-base-100 pr-4">
      <div className="flex-1">
        <Link
          href="/"
          prefetch={false}
          className="btn btn-ghost normal-case text-xl"
        >
          MyMetronome
        </Link>
        <Link className="btn btn-accent" href="/metronome/new">
          <IconPlus />
          New
        </Link>
      </div>
      <div className="flex-none gap-1">
        {isLoggedIn ? (
          <>
            <NavbarSearch />
            <div>
              <label
                htmlFor="my-drawer"
                tabIndex={0}
                className="btn btn-ghost btn-circle  avatar drawer-button"
              >
                <IconMenu2 />
              </label>
            </div>
          </>
        ) : (
          <>
            <Link prefetch={false} href="/login" className="link link-hover">
              Login
            </Link>
            <div className="divider divider-horizontal mx-1"></div>
            <Link prefetch={false} href="/register" className="link link-hover">
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
