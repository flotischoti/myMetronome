import { NextResponse } from 'next/server'
import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'

export default async function Page({ params }: { params: { id: string } }) {
  async function getLastMetronome(user: number) {
    const res = await fetch(
      `http://localhost:3000/api/users/${user}/metronomes?top=1&sortBy=lastOpened&sortOrder=desc`,
      {
        cache: 'no-store',
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
