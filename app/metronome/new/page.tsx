import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'
import { getUserAttrFromToken } from '../../api/util'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { IconInfoCircle } from '@tabler/icons-react'

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const command = cookieStore.get('command')
  const user = await getUserAttrFromToken(token?.value)

  return (
    <div
      id="newMetronomeContainer"
      className="flex flex-col justify-between max-w-sm mx-auto h-full"
    >
      <Metronome dbMetronome={null} user={user} command={command?.value} />
      {!user && (
        <div className="alert alert-info">
          <span>
            <IconInfoCircle className="inline mr-2" />
            <Link href="/login" className="link">
              Sign up
            </Link>
            <span>&nbsp;or&nbsp;</span>
            <Link href="/register" className="link">
              login
            </Link>
            <span>&nbsp;to save metronomes.</span>
          </span>
        </div>
      )}
    </div>
  )
}
