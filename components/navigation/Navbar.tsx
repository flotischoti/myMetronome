import { IconCone2, IconPlus, IconUserCircle } from '@tabler/icons-react'
import Link from 'next/link'
import NavbarAccountDropdown from './NavbarAccountDropdown'
import NavbarLoggedIn from './NavbarLoggedIn'
import Modal from '../searchModal/modal'
import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '@/lib/jwt'
import { StoredMetronome } from '../metronome/Metronome'
import * as metronomeDb from '../../db/metronome'

// export const revalidate = 0
// export const dynamic = 'force-dynamic'

async function getRecent(userId: number): Promise<[number, StoredMetronome[]]> {
  return await metronomeDb.list(userId, 5, 0, 'lastOpened', 'desc', undefined)
}

export default async function Navbar() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  const userId = await getUserAttrFromToken(token?.value)
  const [count, recentMetronomes] = userId ? await getRecent(userId) : [0, []]
  return (
    <>
      {userId && (
        <Modal recentCount={count} recentMetronomes={recentMetronomes} />
      )}
      <div className="navbar bg-base-100 dark:bg-base-200 shadow sticky top-0 z-10">
        <div className="flex-1 gap-2">
          <Link
            href="/"
            prefetch={true}
            className="normal-case text-lg sm:text-xl flex items-center gap-1"
          >
            <IconCone2 />
            <h1 className="font-cursive">Metronomes</h1>
          </Link>
          <a className="btn btn-accent mx-1" href={`/metronome/new`}>
            <IconPlus />
            <span>New</span>
          </a>
        </div>
        <div className="flex-none gap-1">
          {userId ? (
            <NavbarLoggedIn />
          ) : (
            <>
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="link sm:hidden">
                  <IconUserCircle size="36" stroke="1" />
                </label>
                <NavbarAccountDropdown />
              </div>
              <div className="hidden sm:flex pr-2">
                <Link prefetch={true} href="/login" className="link link-hover">
                  Login
                </Link>
                <div className="divider divider-horizontal mx-1"></div>
                <Link
                  prefetch={true}
                  href="/register"
                  className="link link-hover"
                >
                  Sign up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
