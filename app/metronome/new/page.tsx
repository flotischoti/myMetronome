import type { Metadata } from 'next'
import Metronome from '../../../components/metronome/Metronome'
import { getUserAttrFromToken } from '../../api/util'
import { cookies } from 'next/headers'
import LoginAlert from '@/components/loginAlert/loginAlert'

export const metadata: Metadata = {
  title: 'Metronomes - New',
}

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const command = cookieStore.get('command')
  const user = await getUserAttrFromToken(token?.value)

  return (
    <>
      <div>{!user && <LoginAlert />}</div>
      <div id="newMetronomeContainer" className={`max-w-sm mx-auto p-1`}>
        <Metronome dbMetronome={null} user={user} command={command?.value} />
      </div>
    </>
  )
}
