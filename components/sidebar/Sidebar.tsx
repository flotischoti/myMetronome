'use client'

import { TouchEvent, useRef, useState } from 'react'
import Link from 'next/link'
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconList,
  IconLogout,
  IconMail,
  IconUserCircle,
  IconX,
} from '@tabler/icons-react'

export default function Sidebar({ userName }: { userName: string | null }) {
  const touchStart = useRef<number | null>(null)
  const touchEnd = useRef<number | null>(null)

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50

  const onTouchStart = (e: TouchEvent) => {
    touchEnd.current = null
    touchStart.current = e.targetTouches[0].clientX
  }

  const onTouchMove = (e: TouchEvent) =>
    (touchEnd.current = e.targetTouches[0].clientX)

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return
    const distance = touchStart.current - touchEnd.current
    const isRightSwipe = distance < -minSwipeDistance
    if (isRightSwipe) closeDrawer()
  }

  const closeDrawer = () => {
    ;(document.getElementById('my-drawer') as HTMLInputElement)!.checked = false
  }

  return (
    <div className="drawer-side z-20">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <div
        className="menu w-80 p-0 h-full bg-base-200 text-base-content flex-col justify-between"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="p-4">
          <div className="flex justify-between align-center">
            <h1 className="font-bold text-lg break-all">Hello {userName}!</h1>
            <button
              className="btn btn-xs btn-circle no-animation btn-ghost"
              onClick={closeDrawer}
            >
              <IconX />
            </button>
          </div>
          <ul className="mt-2" onClick={closeDrawer}>
            <li>
              <Link href="/list" className="link" prefetch={false}>
                <IconList />
                Metronomes
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
            href="mailto:hello@metronomes.xyz"
            className="btn btn-ghost"
          >
            <IconMail />
          </a>
          <a
            target="_blank"
            href="https://www.instagram.com/flotischoti/"
            className="btn btn-ghost"
          >
            <IconBrandInstagram />
          </a>
          <a
            target="_blank"
            href="https://github.com/flotischoti/myMetronome"
            className="btn btn-ghost"
          >
            <IconBrandGithub />
          </a>
        </div>
      </div>
    </div>
  )
}
