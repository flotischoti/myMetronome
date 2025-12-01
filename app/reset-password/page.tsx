import { Metadata } from 'next'
import { ResetPasswordForm } from './form'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Metronomes - Reset Password',
}

export default function Page() {
  const cookieStore = cookies()
  const command = cookieStore.get('command')
  return <ResetPasswordForm command={command?.value} />
}
