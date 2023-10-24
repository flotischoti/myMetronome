'use client'

import Link from 'next/link'
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconList,
  IconLogout,
  IconUserCircle,
  IconX,
} from '@tabler/icons-react'

export default function Sidebar({ userName }: { userName: string | null }) {
  return (
    <div className="drawer-side z-20">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <div className="menu w-80 p-0 h-full bg-base-200 text-base-content flex-col justify-between">
        <div className="p-4">
          <div className="flex justify-between align-center">
            <h1 className="font-bold text-lg">Hello {userName}!</h1>
            <button
              className="btn btn-xs btn-circle no-animation btn-ghost"
              onClick={() =>
                ((document.getElementById(
                  'my-drawer'
                ) as HTMLInputElement)!.checked = false)
              }
            >
              <IconX />
            </button>
          </div>
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
        <div className="p-4 bg-neutral text-neutral-content flex justify-center">
          <a
            target="_blank"
            href="https://www.instagram.com/flotischoti/"
            className="btn btn-ghost"
          >
            <IconBrandInstagram />
          </a>
          <a
            target="_blank"
            href="https://github.com/flotischoti"
            className="btn btn-ghost"
          >
            <IconBrandGithub />
          </a>
        </div>
      </div>
    </div>
  )
}
