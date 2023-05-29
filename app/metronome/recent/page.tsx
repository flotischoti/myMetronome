import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')

  async function getLastMetronome(user: number) {
    const res = await fetch(
      `http://localhost:3000/api/users/${user}/metronomes?top=1&sortBy=lastOpened&sortOrder=desc`,
      {
        cache: 'no-store',
        headers: {
          'x-access-token': token!.value,
        },
      }
    )

    if (!res.ok) {
      throw new Error(`Failed to load most recent metronome for user ${user}`)
    }

    return res.json()
  }

  const res = await getLastMetronome(1)
  let lastMmetronome: StoredMetronome[] = res.metronomes
  if (!lastMmetronome || lastMmetronome.length != 1) {
    return NextResponse.redirect('/metronome/new')
  }
  return (
    <div>
      <Metronome dbMetronome={lastMmetronome[0]} />
    </div>
  )
}
