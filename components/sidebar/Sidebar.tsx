import Link from 'next/link'
import {
  IconBrandGithub,
  IconBrandInstagram,
  IconList,
  IconLogout,
  IconUserCircle,
} from '@tabler/icons-react'

export default function Sidebar({ userName }: { userName: string | null }) {
  return (
    <div className="drawer-side">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <div className="menu p-4 w-80 h-full bg-base-200 text-base-content">
        <h1 className="font-bold text-lg">{userName}</h1>
        <ul>
          <li>
            <Link href="/list" className="link" prefetch={false}>
              <IconList />
              All Metronomes
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
