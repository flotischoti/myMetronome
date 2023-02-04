import Metronome, { StoredMetronome } from '../components/metronome/Metronome'

async function getMetronome(id: number) {
  const res = await fetch(
    `http://localhost:3000/api/users/bla/metronomes/${id}`,
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
  const metronome: StoredMetronome = await getMetronome(5)

  return <Metronome dbMetronome={metronome} />
}
