import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'
import SearchBox from '../../../components/searchbox/searchbox'
import { cookies } from 'next/headers'
import { decodeToken, verifyToken } from '../../api/util'

async function getMetronome(metronomeId: string, token: string) {
  console.log(`Page. Loading Metronome. Metronome Id: ${metronomeId}`)
  const res = await fetch(
    `http://localhost:3000/api/metronomes/${metronomeId}`,
    {
      cache: 'no-store',
      headers: {
        'x-access-token': token,
      },
    }
  )

  if (!res.ok) {
    throw new Error(
      `Failed to load metronome with id: ${metronomeId}. Error: ${res.statusText}`
    )
  }

  return res.json()
}

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const decodedToken = await decodeToken(token!.value)
  const user = decodedToken!.userId as number

  let metronome: StoredMetronome = await getMetronome(params.id, token!.value)

  return (
    <div>
      <Metronome dbMetronome={metronome} user={user} />
    </div>
  )
}
