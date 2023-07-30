'use client'

import Link from 'next/link'
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconList,
  IconLogout,
  IconUserCircle,
} from '@tabler/icons-react'

export default function Sidebar({
  userName,
  checkBox,
}: {
  userName: string | null
  checkBox: HTMLInputElement
}) {
  return (
    <div className="drawer-side">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <div className="menu p-4 w-80 h-full bg-base-200 text-base-content">
        <h1 className="font-bold text-lg">Hello {userName}!</h1>
        <ul
          className="mt-2"
          onClick={() =>
            ((document.getElementById(
              'my-drawer'
            ) as HTMLInputElement)!.checked = false)
          }
        >
          <li>
            <Link href="/list" className="link" prefetch={false}>
              <IconList />
              My Metronomes
            </Link>
          </li>
          <li>
            <Link href="/account" className="link" prefetch={false}>
              <IconUserCircle />
              Account
            </Link>
          </li>
          <li>
            <Link href="/logout" className="link" prefetch={false}>
              <IconLogout />
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}
