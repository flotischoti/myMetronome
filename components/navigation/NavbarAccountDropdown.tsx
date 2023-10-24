'use client'

import Link from 'next/link'

export default function NavbarAccountDropdown() {
  const handleClick = () => {
    const elem = document.activeElement as HTMLElement
    if (elem) {
      elem?.blur()
    }
  }

  return (
    <ul
      tabIndex={0}
      className="menu menu-sm dropdown-content mt-1 z-[1] p-2 shadow bg-base-100 rounded-box w-fit"
      onClick={handleClick}
    >
      <li>
        <Link prefetch={false} href="/login" className="justify-end p-3">
          Login
        </Link>
      </li>
      <li>
        <Link
          prefetch={false}
          href="/register"
          className="justify-end whitespace-nowrap p-3"
        >
          Sign up
        </Link>
      </li>
    </ul>
  )
}
