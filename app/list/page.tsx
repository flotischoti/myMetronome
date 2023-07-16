import { StoredMetronome } from '../../components/metronome/Metronome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import MetronomeCard from '../../components/metronomeCard/MetronomeCard'
import * as metronomeDb from '../../db/metronome'
import Link from 'next/link'
import ListSearch from '../../components/listSearch/ListSearch'
import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '../api/util'

const pageSize = 3

function getOffest(page: number) {
  if (page <= 1) return 0
  return (page - 1) * pageSize
}

async function getMetronomes(
  userId: number,
  page: number,
  search: string
): Promise<[number, StoredMetronome[]]> {
  const offset = getOffest(page)

  return await metronomeDb.list(userId, pageSize, offset, 'name', 'asc', search)
}

export default async function Page({ searchParams }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
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

  if (count == 0) {
    return (
      <div>
        <span>
          Seems like there is nothing here yet. Let's create{' '}
          <Link href="/metronome/new" prefetch={false}>
            something
          </Link>
        </span>
      </div>
    )
  }

  return (
    <div>
      <ListSearch oldSearch={s} />
      {metronomes.length == 0 && (
        <span>There doesn't seem to be anything here</span>
      )}
      {metronomes.map((m, i) => (
        <MetronomeCard key={i} metronome={m} />
      ))}
      {page <= maxPage && (
        <div className="realtive flex justify-center items-center">
          {page > 1 && (
            <Link href={`/list?${getPagingUrlParams(false)}`} prefetch={false}>
              <FontAwesomeIcon
                icon={faArrowLeft}
                className="hover:cursor-pointer"
                size="xl"
              />
            </Link>
          )}
          <p className="mx-3 p-2 border border-solid border-2 rounded-full">
            {page}
          </p>
          {page < maxPage && (
            <Link href={`/list?${getPagingUrlParams(true)}`} prefetch={false}>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="hover:cursor-pointer"
                size="xl"
              />
            </Link>
          )}

          {count > 0 && (
            <p className="absolute right-10">
              {count} metronome{count > 1 ? 's' : ''} found
            </p>
          )}
        </div>
      )}
    </div>
  )
}
