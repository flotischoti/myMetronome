import Metronome, {
  StoredMetronome,
} from '../../../components/metronome/Metronome'
import { cookies } from 'next/headers'
import { getUserAttrFromToken, isValidNumber } from '../../api/util'
import * as metronomeDb from '../../../db/metronome'

async function getMetronome(metronomeId: string, userId: number) {
  console.log(
    `Page. Loading Metronome. Metronome Id: ${metronomeId} for user ${userId}`
  )

  if (!isValidNumber(metronomeId))
    throw new Error(`GET metronome failed. Metronome ${metronomeId} not valid`)

  const metronome = await metronomeDb.get(Number(metronomeId))

  if (!metronome)
    throw new Error(`GET metronome failed. Metronome ${metronomeId} not found`)

  // TODO replace all this shit by using where clause with metronome + user ID
  if (metronome.owner != userId) {
    throw new Error(
      `GET metronome failed. User ${userId} not allowed to read metronome ${metronomeId}`
    )
  }

  return metronome
}

export default async function Page({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const userId = await getUserAttrFromToken(token!.value)

  let metronome: StoredMetronome = await getMetronome(params.id, userId!)

  return (
    <div>
      <Metronome dbMetronome={metronome} user={userId} />
    </div>
  )
}
