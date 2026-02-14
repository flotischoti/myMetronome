import { Metadata } from 'next'
import { DeleteUserForm } from './form'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Metronomes - Delete account',
}

export default async function Page() {
  const cookieStore = await cookies()
  const command = cookieStore.get('command')
  return <DeleteUserForm command={command?.value} />
}
