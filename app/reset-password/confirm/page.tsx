import { Metadata } from 'next'
import { ConfirmPasswordResetForm } from './form'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Metronomes - Reset Password',
}

export default async function Page() {
  const cookieStore = await cookies()
  const command = cookieStore.get('command')
  return <ConfirmPasswordResetForm command={command?.value} />
}
