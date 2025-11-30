import { Metadata } from 'next'
import { SignUpForm } from './form'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Metronomes - Sign Up',
}

export default function Page() {
  const cookieStore = cookies()
  const command = cookieStore.get('command')
  return <SignUpForm command={command?.value} />
}
