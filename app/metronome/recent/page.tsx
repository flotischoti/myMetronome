import { cookies } from 'next/headers'
import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'
import * as metronomeDb from '../../../db/metronome'
import { getUserAttrFromToken } from '../../../lib/jwt'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Metronomes - Recent',
}

export default async function Page({ params }: { params: { id: string } }) {
  async function getLastMetronome(userId: number): Promise<StoredMetronome[]> {
    const [count, metronomes] = await metronomeDb.list(
      userId,
      1,
      0,
      'lastOpened',
      'desc',
      undefined,
    )

    return metronomes
  }

  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  const command = cookieStore.get('command')
  const userId = await getUserAttrFromToken(token!.value)
  const lastMetronome: StoredMetronome[] = await getLastMetronome(userId!)
  if (!lastMetronome || lastMetronome.length != 1) redirect(`/metronome/new`)

  return (
    <div
      id="recentMetronomeContainer"
      className="max-w-sm mx-auto py-1 px-1 sm:px-0"
    >
      <Metronome
        dbMetronome={lastMetronome[0]}
        user={userId}
        command={command?.value}
      />
    </div>
  )
}
