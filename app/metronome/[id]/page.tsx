import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'
import SearchBox from '../../../components/searchbox/searchbox'
import { cookies } from 'next/headers'

async function getMetronome(user: number, metronomeId: string) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  console.log(`Load Metronome for ID: ${metronomeId}`)
  const res = await fetch(
    `http://localhost:3000/api/users/${user}/metronomes/${metronomeId}`,
    {
      cache: 'no-store',
      headers: {
        'x-access-token': token!.value,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Failed to load metronome with id: ${metronomeId}`)
  }

  return res.json()
}

export default async function Page({ params }: { params: { id: string } }) {
  let metronome: StoredMetronome = await getMetronome(1, params.id)

  return (
    <div>
      <SearchBox />
      <Metronome dbMetronome={metronome} />
    </div>
  )
}
