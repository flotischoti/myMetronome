import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'
import { decodeToken } from '../../api/util'
import Link from 'next/link'
export default async function Page({ params }: { params: { id: string } }) {
  async function getLastMetronome(token: string) {
    const res = await fetch(
      `http://localhost:3000/api/metronomes?top=1&sortBy=lastOpened&sortOrder=desc`,
      {
        cache: 'no-store',
        headers: {
          'x-access-token': token,
        },
      }
    )

    if (!res.ok) {
      throw new Error(`Failed to load most recent metronome`)
    }

    return res.json()
  }

  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const decodedToken = await decodeToken(token!.value)
  const user = decodedToken!.userId as number

  const res = await getLastMetronome(token!.value)
  let lastMmetronome: StoredMetronome[] = res.metronomes
  if (!lastMmetronome || lastMmetronome.length != 1) {
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
      <Metronome dbMetronome={lastMmetronome[0]} user={user} />
    </div>
  )
}
