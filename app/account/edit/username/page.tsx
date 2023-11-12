import { cookies } from 'next/headers'
import { getUserAttrFromToken } from '../../../api/util'
import { Form } from './form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Metronomes - Edit username',
}

const Page = async () => {
  const cookieStore = cookies()
  const token = cookieStore.get('token')
  const userName = await getUserAttrFromToken<string>(token!.value, 'name')

  return <Form userName={userName!} />
}

export default Page
