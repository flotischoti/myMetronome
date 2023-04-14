import { StoredMetronome } from '../../components/metronome/Metronome'
import Redirect from '../../components/redirect/Redirect'

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
  const res = await getLastMetronome(1)
  let lastMmetronome: StoredMetronome[] = res.metronomes
  let metronome: StoredMetronome | null =
    !lastMmetronome || lastMmetronome.length != 1 ? null : lastMmetronome[0]
  const path =
    metronome == null ? '/metronome/new' : `/metronome/${metronome.id}`

  return <Redirect path={path} />
}
