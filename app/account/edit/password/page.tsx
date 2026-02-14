import { Metadata } from 'next'
import { ChangePasswordForm } from './form'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Metronomes - Edit password',
}

export default async function Page() {
  const cookieStore = await cookies()
  const command = cookieStore.get('command')
  return <ChangePasswordForm command={command?.value} />
}
