import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'
import SearchBox from '../../../components/searchbox/searchbox'

async function getMetronome(user: number, metronomeId: string) {
  const res = await fetch(
    `http://localhost:3000/api/users/${user}/metronomes/${metronomeId}`,
    {
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    throw new Error('Failed to load metronome')
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
