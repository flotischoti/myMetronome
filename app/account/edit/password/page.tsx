import { Metadata } from 'next'
import { ChangePasswordForm } from './form'

export const metadata: Metadata = {
  title: 'Metronomes - Edit password',
}

export default function Page() {
  return <ChangePasswordForm />
}
