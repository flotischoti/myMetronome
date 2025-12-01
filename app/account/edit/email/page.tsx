import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '../../../../lib/jwt'
import { UpdateMailForm } from './form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Metronomes - Edit username',
}

const Page = async () => {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const command = cookieStore.get('command')
  const email = await getUserAttrFromToken<string>(token!.value, 'email')

  return <UpdateMailForm email={email!} command={command?.value} />
}

export default Page
