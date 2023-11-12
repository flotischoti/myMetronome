import { Metadata } from 'next'
import { DeleteUserForm } from './form'

export const metadata: Metadata = {
  title: 'Metronomes - Delete account',
}

export default function Page() {
  return <DeleteUserForm />
}
