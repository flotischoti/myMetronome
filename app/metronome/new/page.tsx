import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'
import { decodeToken, verifyToken } from '../../api/util'
import { cookies } from 'next/headers'

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  let user = null as unknown as number
  if (token && (await verifyToken(token!.value))) {
    const decodedToken = await decodeToken(token!.value)
    user = decodedToken!.userId as number
  }

  return (
    <div>
      <Metronome dbMetronome={null} user={user} />
    </div>
  )
}
