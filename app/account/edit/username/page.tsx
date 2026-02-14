import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '../../../../lib/jwt'
import { Form } from './form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Metronomes - Edit username',
}

const Page = async () => {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  const command = cookieStore.get('command')
  const userName = await getUserAttrFromToken<string>(token!.value, 'name')

  return <Form userName={userName!} command={command?.value} />
}

export default Page
