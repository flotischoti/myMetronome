import Metronome from '../../../components/metronome/Metronome'
import { getUserAttrFromToken } from '../../api/util'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { IconInfoCircle, IconX } from '@tabler/icons-react'
import LoginAlert from '@/components/loginAlert/loginAlert'

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const command = cookieStore.get('command')
  const user = await getUserAttrFromToken(token?.value)

  return (
    <>
      <title>Metronomes - New</title>
      <div id="newMetronomeContainer" className="max-w-sm mx-auto">
        <Metronome dbMetronome={null} user={user} command={command?.value} />
        {!user && <LoginAlert />}
      </div>
    </>
  )
}
