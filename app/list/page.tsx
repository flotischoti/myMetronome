import { StoredMetronome } from '../../components/metronome/Metronome'
import * as metronomeDb from '../../db/metronome'
import Link from 'next/link'
import ListSearch from '../../components/listSearch/ListSearch'
import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '../api/util'
import { IconChevronsLeft, IconChevronsRight } from '@tabler/icons-react'
import MetronomeCardContainer from '@/components/metronomeCard/MetronomeCardContainer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Metronomes - List',
}

const pageSize = 5

function getOffest(page: number) {
  if (page <= 1) return 0
  return (page - 1) * pageSize
}

async function getMetronomes(
  userId: number,
  page: number,
  search: string,
): Promise<[number, StoredMetronome[]]> {
  const offset = getOffest(page)

  return await metronomeDb.list(userId, pageSize, offset, 'name', 'asc', search)
}

export default async function Page({
  searchParams,
}: {
  searchParams: { page: number; s: string }
}) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const command = cookieStore.get('command')
  const userId = await getUserAttrFromToken(token!.value)
  let { page = 1, s = '' } = searchParams
  const [count, metronomes] = await getMetronomes(userId!, page, s)
  const maxPage = Math.ceil(count / pageSize)

  function getPagingUrlParams(up: boolean) {
    const params = [
      `s=${s}`,
      `page=${up ? Number(page) + 1 : Number(page) - 1}`,
    ]
    return params.join('&')
  }

  return (
    <div>
      <ListSearch oldSearch={s} />
      <div className="divider text-xs">
        {count} metronome{count > 1 || count == 0 ? 's' : ''} found
      </div>
      <MetronomeCardContainer
        metronomes={metronomes}
        command={command?.value}
        user={userId}
      />
      {page <= maxPage && (
        <div className="realtive flex justify-center items-center my-4">
          <div className="join">
            <Link
              href={`/list?${getPagingUrlParams(false)}`}
              prefetch={false}
              className={`join-item btn ${page <= 1 ? 'btn-disabled' : ''}`}
            >
              <IconChevronsLeft />
            </Link>
            <button className="join-item btn no-animation btn-disabled btn-neutral border-none">
              Page {page}
            </button>
            <Link
              href={`/list?${getPagingUrlParams(true)}`}
              prefetch={false}
              className={`join-item btn ${
                page >= maxPage ? 'btn-disabled' : ''
              }`}
            >
              <IconChevronsRight />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
