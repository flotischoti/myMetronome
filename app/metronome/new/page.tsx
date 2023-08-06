import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'
import { getUserAttrFromToken } from '../../api/util'
import { cookies } from 'next/headers'

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  let user = await getUserAttrFromToken(token?.value)

  return <Metronome dbMetronome={null} user={user} />
}
