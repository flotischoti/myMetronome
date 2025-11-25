import { Metadata } from 'next'
import { LoginForm } from './form'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Metronomes - Login',
}

export default function Page() {
  const cookieStore = cookies()
  const command = cookieStore.get('command')
  return <LoginForm command={command?.value} />
}
