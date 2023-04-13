import { StoredMetronome } from '../../components/metronome/Metronome'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
import MetronomeCard from '../../components/metronomeCard/MetronomeCard'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function getOffest(page: number) {
  if (page <= 0) return 0
  return page * 3
}

async function getMetronomes(user: number, page: number) {
  const offset = getOffest(page)
  const res = await fetch(
    `http://localhost:3000/api/users/${user}/metronomes?top=3&offset=${offset}&sortBy=name&sortOrder=asc`,
    {
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    throw new Error(
      `Failed to load list of metronomes for user ${user} with error: ${res.statusText}`
    )
  }

  return res.json()
}

export default async function Page({ searchParams }) {
  const user = 1
  let { page = 0 } = searchParams
  if (page < 0) {
    page = 0
  }
  const metronomes: StoredMetronome[] = await getMetronomes(user, page)
  console.log(`Page: ${searchParams.page}`)

  return (
    <div>
      {metronomes.length == 0 && (
        <span>There doesn't seem to be anything here</span>
      )}
      {metronomes.map((m, i) => (
        <MetronomeCard key={i} metronome={m} />
      ))}
      <div className="flex justify-center">
        {page > 0 && (
          <Link href={`/list?page=${Number(page) - 1}`}>
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="hover:cursor-pointer"
            />
          </Link>
        )}
        <Link href={`/list?page=${Number(page) + 1}`}>
          <FontAwesomeIcon
            icon={faArrowRight}
            className="hover:cursor-pointer"
          />
        </Link>
      </div>
    </div>
  )
}
