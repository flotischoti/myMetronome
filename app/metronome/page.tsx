import Metronome, {
  StoredMetronome,
} from '../../components/metronome/Metronome'
import SearchBox from '../../components/searchbox/searchbox'

async function getLastMetronome(user: number) {
  const res = await fetch(
    `http://localhost:3000/api/users/${user}/metronomes?top=1&sortBy=lastOpened&sortOrder=desc`,
    {
      cache: 'no-store',
    }
  )

  if (!res.ok) {
    throw new Error('Failed to load metronome')
  }

  return res.json()
}

export default async function Page() {
  let lastMmetronome: StoredMetronome[] = await getLastMetronome(1)
  let metronome: StoredMetronome | null =
    !lastMmetronome || lastMmetronome.length != 1 ? null : lastMmetronome[0]

  return (
    <div>
      <SearchBox />
      <Metronome dbMetronome={metronome} />
    </div>
  )
}
